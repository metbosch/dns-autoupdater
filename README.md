# dns_autoupdater
NodeJS tool to automatically check the IP address of you computer ports and update the DNS records if needed

### Configuration JSON
 - **logger**: Where the logs must be sent, options: `winevents` || `console`. `winevents` will use the Windows log utility, `console` will write to the current process output.
