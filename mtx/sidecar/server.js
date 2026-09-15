const cds = require('@sap/cds')

cds.once('served', async () => {
  const provisioning = await cds.connect.to('cds.xt.SaasProvisioningService')
  provisioning.prepend(srv => {
    srv.on('dependencies', () => {
      return [
        { xsappname: 'clone17dee8de53494d868ba4404f2d09532e!b612520|destination-xsappname!b62' }
      ]
    })
  })
})

//Get xsappname from cf env vcplanner_mt-mtx | grep -A 20 '"destination"'