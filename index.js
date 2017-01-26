const async   = require('async'),
      config  = require('config'),
      Freenom = require('freenom-dns'),
      network = require('network'),
      logger  = require('logops');

const freenom = Freenom.init(config.get('freenom.email'), config.get('freenom.password'));

// pubIPs['iface.name'] = public_ip
var pubIPs = {};

function compareInterfaces(a, b) {
  //ip_address":"192.168.3.222","mac_address":"d8:fc:93:13:1a:3c","gateway_ip":"192.168.3.249
  return (a && b) ? (a.name === b.name && a.ip_address === b.ip_address && a.mac_address === b.mac_address && a.gateway_ip === b.gateway_ip && a.netmask === b.netmask) : false;
};

function updateDnsRecord(domain, ip, callback) {
  logger.info("Updating the DNS record of domain " + domain + ". New IP is " + ip);
  async.retry({
    times: config.get('freenom.max_retries'),
    interval: config.get('freenom.retry_interval')
  }, (next, results) => {
    freenom.dns.setRecord(domain, 'A', ip, config.get('freenom.ttl'))
      .then((ret)  => { next(null, ret); })
      .catch((err) => { console.log(err); next(err); });
  }, callback);
};

function checkCurrentIP() {
  var iface0, pubIP;
  async.waterfall([
    network.get_active_interface,
    (iface, callback) => {
      iface0 = iface;
      callback(null);
    },
    network.get_public_ip,
    (ip, callback) => {
      pubIP = ip;
      callback(null);
    },
    network.get_active_interface
  ], (err0, iface1) => {
    if (err0) {
      //Something went wrong getting the info
      logger.warn("Error checking the public IP. " + err0.message);
    } else if (!compareInterfaces(iface0, iface1)) {
      //The initial and final used interfaces don't match

      logger.warn("The initial an final used interface don't match");
      logger.warn(iface0);
      logger.warn(iface1);
    } else if (!pubIPs[iface1.name] || pubIPs[iface1.name] !== pubIP) {
      //The public IP changed or we don't know the DNS record

      logger.info("New public IP detected. Interface " + iface1.name + " has ip " + pubIP);
      if (config.has('domains.' + iface1.name)) {
        var domain = config.get('domains.' + iface1.name);
        updateDnsRecord(domain, pubIP, (err1) => {
          if (err1) {
            logger.error("Error updating the DNS record of domain " + domain + ". " + err1.message);
          } else {
            pubIPs[iface1.name] = pubIP;
          }
        });
      } else {
        logger.error("Cannot find the domain of interface " + iface1.name + ". It has to appear in the domains section of configuration file.");
      }
    } else {
      //The public IP didn't change
      logger.info("Public IP of interface " + iface1.name + " doesn't change");
    }
  });
};


checkCurrentIP();
