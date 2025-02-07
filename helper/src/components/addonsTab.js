/* eslint-disable import/no-anonymous-default-export */
import React from 'react';
import { TextField, Link, Separator, Dropdown, Slider, Stack, Text, Label, ChoiceGroup, Checkbox, MessageBar, MessageBarType, SpinButton } from '@fluentui/react';
import { adv_stackstyle, hasError, getError } from './common'


export default function ({ tabValues, updateFn, featureFlag, invalidArray }) {
    const { cluster, addons, net } = tabValues
    const osmFeatureFlag = featureFlag.includes('osm')
    const wiFeatureFlag = featureFlag.includes('workloadId')
    function setContainerLogV2BasicLogs(v) {
        // Function ensures that the ContainerLogV2 schema is
        // enabled when enabling ContainerLogV2 Basic Logs.
        if(v){
            updateFn("containerLogsV2", v)
            updateFn("containerLogsV2BasicLogs", v)
        }else{
            updateFn("containerLogsV2BasicLogs", v)
        }
    }
    function setContainerLogsV2(v){
        // Function ensures that all the dependencies
        // of the ContainerLogV2 schema is disabled.
        if(v){
            updateFn("containerLogsV2", v)
        }else{
            updateFn("containerLogsV2", v)
            updateFn("containerLogsV2BasicLogs", v)
        }
    }
    return (
        <Stack tokens={{ childrenGap: 15 }} styles={adv_stackstyle}>

            <Stack.Item align="start">
                <Label required={true}>
                    Do you require a secure private container registry to store my application images
                </Label>
                <ChoiceGroup
                    styles={{ root: { marginLeft: '50px' } }}
                    selectedKey={addons.registry}
                    options={[
                        { key: 'none', text: 'No, my application images will be on DockerHub or another registry' },
                        { key: 'Basic', text: 'Yes, setup Azure Container Registry "Basic" tier & authorise aks to pull images' },
                        { key: 'Standard', text: 'Yes, setup Azure Container Registry "Standard" tier (minimum recommended for production)' },
                        { key: 'Premium', text: 'Yes, setup Azure Container Registry "Premium" tier (required for Private Link)' }
                    ]}
                    onChange={(ev, { key }) => updateFn("registry", key)}
                />
                {hasError(invalidArray, 'registry') &&
                    <MessageBar styles={{ root: { marginLeft: '50px', width: '700px' } }} messageBarType={MessageBarType.error}>{getError(invalidArray, 'registry')}</MessageBar>
                }

            </Stack.Item>

            <Stack.Item align="center" styles={{ root: { width: '700px' }}}>
                <Checkbox checked={addons.enableACRTrustPolicy} onChange={(ev, v) => updateFn("enableACRTrustPolicy", v)} label={<Text>Enable ACR Docker Content Trust Capability (<a target="_new" href="https://docs.microsoft.com/azure/container-registry/container-registry-content-trust">docs</a>)</Text>} />
                {addons.enableACRTrustPolicy === true &&
                    <MessageBar styles={{ root: { marginTop: '10px',width: '700px' } }} messageBarType={MessageBarType.info}>To enable client trust in AKS, leverage open source tooling eg. <a target="_new" href="https://github.com/sse-secure-systems/connaisseur">Connaisseur</a>  (<a target="_new" href="https://github.com/Gordonby/connaisseur-aks-acr">sample</a>)</MessageBar>
                }
            </Stack.Item>

            <Stack.Item align="center" styles={{ root: { width: '700px' }}}>
                <Checkbox disabled={addons.registry !== "Premium"} checked={addons.acrUntaggedRetentionPolicyEnabled} onChange={(ev, v) => updateFn("acrUntaggedRetentionPolicyEnabled", v)} label={<Text>Create untagged image retention policy (<a target="_new" href="https://docs.microsoft.com/azure/container-registry/container-registry-content-trust">docs</a>) (*preview)</Text>} />
                <MessageBar styles={{ root: { marginTop: '10px', width: '700px' } }} messageBarType={MessageBarType.warning}>Deleting untagged images will remove them from your ACR after a defined period (<a target="_new" href="https://docs.microsoft.com/en-us/azure/container-registry/container-registry-retention-policy">docs</a>) (*preview)</MessageBar>

                {addons.acrUntaggedRetentionPolicyEnabled && (
                    <Stack.Item style={{ marginTop: '10px', marginLeft: "50px"}}>
                        <Slider label="Days to retain untagged images for" min={0} max={365} step={1} defaultValue={addons.acrUntaggedRetentionPolicy} showValue={true}
                            onChange={(v) => updateFn("acrUntaggedRetentionPolicy", v)}
                            snapToStep />
                    </Stack.Item>
                )}
            </Stack.Item>

            <Stack.Item align="center" styles={{ root: { width: '700px' }}}>
                <Checkbox disabled={addons.registry === "none" || !net.vnetprivateend} checked={addons.acrPrivatePool} onChange={(ev, v) => updateFn("acrPrivatePool", v)} label={<Text>Create ACR Private Agent Pool (private link only) (preview limited regions <a target="_new" href="https://docs.microsoft.com/azure/container-registry/tasks-agent-pools">docs</a>)</Text>} />
                <Stack horizontal styles={{ root: { marginLeft: "50px" } }}>
                    <TextField disabled={true} label="Agent Pool" defaultValue="S1"/>
                    <TextField disabled={true} label="O/S" defaultValue="Linux"/>
                    <TextField disabled={true} label="Agent Count" defaultValue="1"/>
                </Stack>
            </Stack.Item>

            <Separator className="notopmargin" />

            <Stack.Item align="start">
                <Label required={true}>
                    Ingress Controllers: Securely expose your applications via Layer 7 HTTP(S) proxies
                </Label>
                {cluster.osType==='Windows' && addons.ingress !== 'none' &&
                    <MessageBar styles={{ root: { marginTop: '20px', marginLeft: '50px', width: '700px' } }} messageBarType={MessageBarType.warning}>
                        Please Note: If you're using Windows Nodes not all Ingress Controllers will support this OS, please check the Ingress Controller documentation and change the OS or Ingress Controller as required.
                    </MessageBar>
                }
                <ChoiceGroup
                    styles={{ root: { marginLeft: '50px' } }}
                    selectedKey={addons.ingress}
                    options={[
                        { key: 'none', text: 'Not required' },
                        { key: 'appgw', text: 'Azure Application Gateway Ingress Controller add-on (https://azure.github.io/application-gateway-kubernetes-ingress)' },
                        { key: 'warNginx', text: 'AKS Web App Routing Solution, simple Nginx Ingress Controller (https://docs.microsoft.com/en-us/azure/aks/web-app-routing *preview)' },
                        { key: 'contour', text: 'Contour (https://projectcontour.io/)' },
                        { key: 'nginx', text: 'Nginx ingress controller' },
                        { key: 'traefik', text: 'Traefik ingress controller' }
                    ]}
                    onChange={(ev, { key }) => updateFn("ingress", key)}
                />
                {hasError(invalidArray, 'ingress') &&
                    <MessageBar styles={{ root: { marginTop: '20px', marginLeft: '50px', width: '700px' } }} messageBarType={MessageBarType.error}>{getError(invalidArray, 'ingress')}</MessageBar>
                }
            </Stack.Item>

            <Stack.Item align="center" styles={{ root: { maxWidth: '700px', display: (addons.ingress === "none" ? "none" : "block") } }} >
                <Stack tokens={{ childrenGap: 15 }}>
                    {addons.ingress === "nginx" && false &&
                        <MessageBar messageBarType={MessageBarType.warning}>You requested a high security cluster & nginx public ingress. Please ensure you follow this information after deployment <Link target="_ar1" href="https://docs.microsoft.com/en-us/azure/firewall/integrate-lb#public-load-balancer">Asymmetric routing</Link></MessageBar>
                    }
                    {addons.ingress !== "none" && false &&
                        <MessageBar messageBarType={MessageBarType.warning}>You requested a high security cluster. The DNS and Certificate options are disabled as they require additional egress application firewall rules for image download and webhook requirements. You can apply these rules and install the helm chart after provisioning</MessageBar>
                    }

                    {addons.ingress === "appgw" && (

                        net.vnet_opt === 'default' ?
                            <MessageBar messageBarType={MessageBarType.warning}>Using default networking, so addon will provision default Application Gateway instance, for more options, select custom networking in the network tab</MessageBar>
                            :
                            <>
                                <MessageBar messageBarType={MessageBarType.warning}>Custom or BYO networking is requested, so template will provision a new Application Gateway</MessageBar>

                                <Checkbox inputProps={{ 'data-testid': "addons-ingress-appgwKVIntegration-Checkbox"}} checked={addons.appgwKVIntegration} onChange={(ev, v) => updateFn("appgwKVIntegration", v)} label={<Text>Enable KeyVault Integration for TLS Certificates (<Link target="_ar1" href="https://docs.microsoft.com/en-us/azure/application-gateway/key-vault-certs">docs</Link>) </Text>} />
                                {hasError(invalidArray, 'appgwKVIntegration') &&
                                    <MessageBar styles={{ root: { marginTop: '0px !important' } }} messageBarType={MessageBarType.error}>{getError(invalidArray, 'appgwKVIntegration')}</MessageBar>
                                }

                                <Stack.Item>
                                    <Label style={{ marginBottom: "0px" }}>Application Gateway Type (<Link target='_' href='https://docs.microsoft.com/en-us/azure/web-application-firewall/ag/ag-overview'>docs</Link>)</Label>
                                    <ChoiceGroup
                                        selectedKey={addons.appGWsku}
                                        options={[
                                            { key: 'Standard_v2', text: 'Standard_v2: Standard Application Gateway' },
                                            { key: 'WAF_v2', text: 'WAF_v2: Web Application Firewall (WAF) on Application Gateway' }
                                        ]}
                                        onChange={(ev, { key }) => updateFn("appGWsku", key)}
                                    />
                                </Stack.Item>

                                { addons.appGWsku === 'WAF_v2' &&
                                    <Stack.Item style={{ marginLeft: "20px"}}>
                                        <Checkbox checked={addons.appGWenableFirewall} onChange={(ev, v) => updateFn("appGWenableFirewall", v)} label={<Text>Enable Firewall: Provides centralized protection of your web applications from common exploits and vulnerabilities</Text>} />

                                        { addons.appGWenableFirewall &&
                                            <Stack.Item style={{ marginLeft: "25px"}}>
                                                <Label style={{ marginBottom: "0px", marginTop: "5px" }}>WAF mode</Label>
                                                <ChoiceGroup
                                                    style={{marginBottom: "0px", marginTop: "0px" }}
                                                    selectedKey={addons.appGwFirewallMode}
                                                    options={[
                                                        { key: 'Prevention', text: 'Prevention:   Blocks intrusions and attacks that the rules detect' },
                                                        { key: 'Detection', text: 'Detection:   Monitors and logs all threat alerts.' }
                                                    ]}
                                                    onChange={(ev, { key }) => updateFn("appGwFirewallMode", key)}
                                                />
                                            </Stack.Item>
                                        }
                                    </Stack.Item>
                                }

                                <Label style={{ marginBottom: "0px" }}>Capacity</Label>
                                <Stack horizontal tokens={{ childrenGap: 150 }} styles={{ root: { marginTop: '0px !important' } }}>
                                    <Stack.Item>
                                        <ChoiceGroup selectedKey={addons.appGWautoscale} onChange={(ev, { key }) => updateFn("appGWautoscale", key)}
                                            options={[
                                                {
                                                    key: false,
                                                    text: 'Manual'
                                                }, {
                                                    key: true,
                                                    text: 'Autoscale'
                                                }
                                            ]} />
                                    </Stack.Item>
                                    <Stack.Item>
                                        <Stack tokens={{ childrenGap: 0 }} styles={{ root: { width: 450 } }}>
                                            <Slider label={`${addons.appGWautoscale ? "Minimum instance count" : "Instance count"}`} min={addons.appGWautoscale ? 0 : 1} max={125} step={1} defaultValue={addons.appGWcount} showValue={true}
                                                onChange={(v) => updateFn("appGWcount", v)} />
                                            {addons.appGWautoscale && (
                                                <Slider label="Maximum instance count" min={2} max={125} step={1} defaultValue={addons.appGWmaxCount} showValue={true}
                                                    onChange={(v) => updateFn("appGWmaxCount", v)}
                                                    snapToStep />
                                            )}
                                        </Stack>
                                    </Stack.Item>
                                </Stack>

                                <Checkbox checked={addons.appgw_privateIp} onChange={(ev, v) => updateFn("appgw_privateIp", v)} label={<Text>Use a Private Frontend IP for Ingress (<Link target="_ar1" href="https://docs.microsoft.com/en-us/azure/application-gateway/ingress-controller-private-ip">docs</Link>)</Text>} />
                                {addons.appgw_privateIp &&
                                    <TextField value={addons.appgw_privateIpAddress} onChange={(ev, v) => updateFn("appgw_privateIpAddress", v)} errorMessage={getError(invalidArray, 'appgw_privateIpAddress')} required placeholder="Resource Id" label={<Text style={{ fontWeight: 600 }}>Enter Private IP address from the AppGW CIDR subnet range (<b>{net.vnet_opt === 'custom' ? net.vnetAppGatewaySubnetAddressPrefix : 'examine BYO subnet range'}</b>)</Text>} />
                                }
                            </>)
                    }

                    {(addons.ingress === "contour" || addons.ingress === "nginx" || addons.ingress === "appgw" || addons.ingress === "traefik") &&
                        <>
                            <MessageBar messageBarType={MessageBarType.warning}>Using a in-cluster ingress option with Azure Firewall will require additional asymmetric routing configuration post-deployment, please see <Link target="_target" href="https://docs.microsoft.com/azure/aks/limit-egress-traffic#add-a-dnat-rule-to-azure-firewall">Add a DNAT rule to Azure Firewall </Link></MessageBar>
                            <Checkbox inputProps={{ "data-testid": "addons-dns"}} checked={addons.dns} onChange={(ev, v) => updateFn("dns", v)} label={
                                <Text>Create FQDN URLs for your applications using
                                    <Link target="_t1" href="https://github.com/kubernetes-sigs/external-dns"> <b>external-dns</b> </Link>
                                    (requires Azure <Link href="https://docs.microsoft.com/en-us/azure/dns/dns-getstarted-portal#create-a-dns-zone" target="_t1"> <b>Public</b> </Link> or <Link href="https://docs.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal" target="_t1"> <b>Private</b> </Link> DNS Zone)
                                </Text>} />
                            {addons.dns &&
                                <>
                                    <MessageBar messageBarType={MessageBarType.warning}>If using a Public DNS Zone, you need to own a custom domain, you can easily purchase a custom domain through Azure <Link target="_t1" href="https://docs.microsoft.com/en-us/azure/app-service/manage-custom-dns-buy-domain"> <b>details here</b></Link></MessageBar>
                                    <TextField value={addons.dnsZoneId} onChange={(ev, v) => updateFn("dnsZoneId", v)} errorMessage={getError(invalidArray, 'dnsZoneId')} required placeholder="Resource Id" label={<Text style={{ fontWeight: 600 }}>Enter your Public or Private Azure DNS Zone ResourceId <Link target="_t2" href="https://ms.portal.azure.com/#blade/HubsExtension/BrowseResource/resourceType/Microsoft.Network%2FdnsZones">find it here</Link></Text>} />

                                    <Checkbox inputProps={{ "data-testid": "addons-certMan"}} disabled={hasError(invalidArray, 'dnsZoneId')} checked={addons.certMan} onChange={(ev, v) => updateFn("certMan", v)} label="Automatically Issue Certificates for HTTPS using cert-manager (with Lets Encrypt - requires email" />
                                    {addons.certMan &&
                                        <TextField value={addons.certEmail} onChange={(ev, v) => updateFn("certEmail", v)} errorMessage={getError(invalidArray, 'certEmail') ? "Enter valid email" : ''} label="Enter mail address for certificate notification:" required />
                                    }
                                </>
                            }
                        </>
                    }

                    {(addons.ingress === "nginx" || addons.ingress === "contour") &&
                        <Checkbox checked={addons.ingressEveryNode} onChange={(ev, v) => updateFn("ingressEveryNode", v)} label={<Text>Run proxy on every node (deploy as Daemonset)</Text>} />
                    }

                </Stack>
            </Stack.Item>

            <Separator className="notopmargin" />

            <Stack.Item align="start">
                <Label >Cluster Monitoring requirements</Label>
                <MessageBar>Observing your clusters health is critical to smooth operations, select the managed Azure Monitor for Containers option, or the open source CNCF Prometheus/Grafana solution</MessageBar>
                { addons.monitor === "aci" &&
                    <MessageBar messageBarType={MessageBarType.info}>For sending logs to a central subscription workspace, use <Link target="_target" href="https://learn.microsoft.com/azure/azure-monitor/essentials/diagnostic-settings-policy">Azure Policy</Link> to configure AKS DiagnosticSettings.</MessageBar>
                }
                <ChoiceGroup
                    styles={{ root: { marginLeft: '50px' } }}
                    selectedKey={addons.monitor}
                    options={[
                        { key: 'none', text: 'None' },
                        { key: 'aci', text: 'Azure Monitor for Containers (logs and metrics)' },
                        { key: 'oss', text: 'Prometheus / Grafana Helm Chart (metrics only)' }

                    ]}
                    onChange={(ev, { key }) => updateFn("monitor", key)}
                />
            </Stack.Item>

            {addons.monitor === 'oss' && (addons.ingress === "contour" || addons.ingress === "nginx" || addons.ingress === "appgw" || addons.ingress === "traefik") && addons.dns && addons.certMan &&
                <Stack.Item align="center" styles={{ root: { maxWidth: '700px'}}}>
                    <MessageBar messageBarType={MessageBarType.warning}>This will expose your your grafana dashboards to the internet, please login and change the default credentials asap (admin/prom-operator)</MessageBar>
                    <Checkbox styles={{ root: { marginTop: '10px'}}} checked={addons.enableMonitorIngress} onChange={(ev, v) => updateFn("enableMonitorIngress", v)} label={`Enable Public Ingress for Grafana (https://grafana.${addons.dnsZoneId && addons.dnsZoneId.split('/')[8]})`} />
                </Stack.Item>
            }

            { addons.monitor === "aci" &&
                <Stack.Item align="center" styles={{ root: { maxWidth: '700px'}}}>
                    <Dropdown
                        label="Log and Metrics Data Retention (Days)"
                        onChange={(ev, { key }) => updateFn("retentionInDays", key)} selectedKey={addons.retentionInDays}
                        options={[
                            { key: 30, text: '30 Days' },
                            { key: 60, text: '60 Days' },
                            { key: 90, text: '90 Days' },
                            { key: 120, text: '120 Days' },
                            { key: 180, text: '180 Days' },
                            { key: 270, text: '270 Days' },
                            { key: 365, text: '365 Days' }
                        ]}
                    />

                    <SpinButton
                        label="Daily data cap (GB)"
                        value={addons.logDataCap}
                        onChange={(ev, v) => updateFn("logDataCap", v)}
                        min={0}
                        step={1}
                        incrementButtonAriaLabel="Increase value by 1"
                        decrementButtonAriaLabel="Decrease value by 1"
                        styles={{ root: { marginTop: '15px'}}}
                    />
                    <Checkbox styles={{ root: { marginTop: '10px', marginBottom: '10px'}}} checked={addons.containerLogsV2} onChange={(ev, v) => setContainerLogsV2(v)} label={<Text>Enable the ContainerLogV2 schema (<Link target="_target" href="https://learn.microsoft.com/en-us/azure/azure-monitor/containers/container-insights-logging-v2">docs</Link>) (*preview)</Text>} />

                    <MessageBar messageBarType={MessageBarType.warning}>Enable the ContainerLogV2 (successor for ContainerLog) schema for additional data capture and friendlier schema. Disabling this feature will also disable features that are dependent on it (e.g. Basic Logs).</MessageBar>

                    <Checkbox styles={{ root: { marginTop: '10px', marginBottom: '10px'}}} checked={addons.containerLogsV2BasicLogs} onChange={(ev, v) => setContainerLogV2BasicLogs(v)} label={<Text>Set Basic Logs for ContainerLogV2 (<Link target="_target" href="https://learn.microsoft.com/en-us/azure/azure-monitor/logs/basic-logs-configure?tabs=portal-1%2Cportal-2">docs</Link>) (*preview)</Text>} />

                    <MessageBar messageBarType={MessageBarType.warning}>Enable the Basic log data plan to cost optimise on log ingestion at the cost of a lower retention period, some log query operations that are no longer available and no alerts. Enabling Basic Logs for ContainerLogsV2 has a dependency on the ContainerLogsV2 schema and thus enabling this capability will automatically enable ContainerLogsV2. In addition, the ContainerLogsV2 table's retention is fixed at eight days. More information available via the provided docs link.</MessageBar>

                    <Checkbox styles={{ root: { marginTop: '10px'}}} checked={addons.createAksMetricAlerts} onChange={(ev, v) => updateFn("createAksMetricAlerts", v)} label={<Text>Create recommended metric alerts, enable you to monitor your system resource when it's running on peak capacity or hitting failure rates (<Link target="_target" href="https://azure.microsoft.com/en-us/updates/ci-recommended-alerts/">docs</Link>) </Text>} />

                </Stack.Item>
            }

            <Separator className="notopmargin" />

            <Stack.Item align="start">

                <Label >Azure Policy, to manage and report on the compliance state of your Kubernetes clusters</Label>
                <MessageBar>Azure Policy extends Gatekeeper v3, an admission controller webhook for Open Policy Agent (OPA), to apply at-scale enforcements and safeguards on your clusters in a centralized, consistent manner.
                </MessageBar>
                <ChoiceGroup
                    styles={{ root: { marginLeft: '50px' } }}
                    selectedKey={addons.azurepolicy}
                    options={[
                        { key: 'none', text: 'No restrictions, users can deploy any kubernetes workloads' },
                        { key: 'audit', text: 'AUDIT non-compliant Linux-based workloads with the set of cluster pod security baseline standards' },
                        { key: 'deny', text: 'BLOCK non-compliant Linux-based workloads with the set of cluster pod security baseline standards' }
                    ]}
                    onChange={(ev, { key }) => updateFn("azurepolicy", key)}
                />
                {addons.azurepolicy !== 'none' &&
                <Stack.Item align="center" styles={{ root: { maxWidth: '700px'}}}>
                    <Dropdown
                        label="Azure Policy Initiative"
                        onChange={(ev, { key }) => updateFn("azurePolicyInitiative", key)} selectedKey={addons.azurePolicyInitiative}
                        styles={{ root: {  marginTop: '20px', marginLeft: '100px', width: '700px' } }}
                        options={[
                            { key: 'Baseline', text: 'Baseline pod security standards' },
                            { key: 'Restricted', text: 'Restricted pod security standards' }
                        ]}
                    />
                    <MessageBar messageBarType={MessageBarType.success} styles={{ root: { marginTop: '20px', marginLeft: '100px', width: '700px' } }}>
                        The baseline policy will automatically assign and <b>{addons.azurepolicy}</b> the following <Link target="_target" href="https://github.com/Azure/azure-policy/blob/master/built-in-policies/policySetDefinitions/Kubernetes/Kubernetes_PSPBaselineStandard.json">Policies</Link>:
                        <ul>
                            <li>Do not allow privileged containers in Kubernetes cluster</li>
                            <li>Kubernetes cluster pods should only use approved host network and port range</li>
                            <li>Kubernetes cluster containers should not share host process ID or host IPC namespace</li>
                            <li>Kubernetes cluster containers should only use allowed capabilities</li>
                            <li>Kubernetes cluster pod hostPath volumes should only use allowed host paths</li>
                        </ul>

                        The restricted policy will additionally automatically assign and <b>{addons.azurepolicy}</b> the following <Link target="_target" href="https://github.com/Azure/azure-policy/blob/master/built-in-policies/policySetDefinitions/Kubernetes/Kubernetes_PSPRestrictedStandard.json">Policies</Link>:
                        <ul>
                            <li>Kubernetes cluster containers should only use allowed seccomp profiles</li>
                            <li>Kubernetes cluster pods should only use allowed volume types</li>
                            <li>Kubernetes cluster pods and containers should only run with approved user and group IDs</li>
                        </ul>

                        To review these policies and browse other policies that can be applied at other scopes, see the <Link target="_target" href="https://docs.microsoft.com/azure/aks/policy-reference">Policy Docs</Link>
                    </MessageBar>
                </Stack.Item>
                }
            </Stack.Item>
            <Separator className="notopmargin" />
            <Stack.Item align="start">
                <Label >Cluster East-West traffic restrictions (Network Policies)</Label>
                <MessageBar>Control which components can communicate with each other. The principle of least privilege should be applied to how traffic can flow between pods in an Azure Kubernetes Service (AKS) cluster.</MessageBar>
                {hasError(invalidArray, 'networkPolicy') &&
                    <MessageBar messageBarType={MessageBarType.error} styles={{ root: { marginTop: '20px', marginLeft: '50px', width: '700px' } }}>{getError(invalidArray, 'networkPolicy')}</MessageBar>
                }
                <ChoiceGroup
                    styles={{ root: { marginLeft: '50px' } }}
                    selectedKey={addons.networkPolicy}
                    errorMessage={getError(invalidArray, 'networkPolicy')}
                    options={[
                        { "data-testid":'addons-netpolicy-none', key: 'none', text: 'No restrictions, all PODs can access each other' },
                        { "data-testid":'addons-netpolicy-calico', disabled: net.ebpfDataplane, key: 'calico', text: 'Use Calico to implement intra-cluster traffic restrictions' },
                        { "data-testid":'addons-netpolicy-azure', disabled: net.ebpfDataplane, key: 'azure', text: 'Use Azure NPM to implement intra-cluster traffic restrictions ' },
                        { "data-testid":'addons-netpolicy-cilium', key: 'cilium', text: 'Use Cilium to implement intra-cluster traffic restrictions (requires Cilium backplane for CNI).' }
                    ]}
                    onChange={(ev, { key }) => updateFn("networkPolicy", key)}
                />

            </Stack.Item>

            <Stack.Item align="center" styles={{ root: { maxWidth: '700px', display: (addons.networkPolicy === "none" ? "none" : "block") } }} >
                <Stack tokens={{ childrenGap: 15 }}>
                    <MessageBar messageBarType={MessageBarType.warning}>A Default Deny Network Policy provides an enhanced security posture. Pods without policy are not allowed traffic. Please use caution, with apps that you know have policy defined.</MessageBar>
                    <Checkbox inputProps={{ "data-testid": "addons-netpolicy-denydefault-Checkbox"}} disabled={addons.networkPolicy === 'none'} checked={addons.denydefaultNetworkPolicy} onChange={(ev, v) => updateFn("denydefaultNetworkPolicy", v)} label="Create a default deny policy in the default namespace" />
                </Stack>
            </Stack.Item>

            <Separator className="notopmargin" />

            <Stack.Item align="start">
                <Label required={true}>
                    CSI Secrets : Store Kubernetes Secrets in Azure KeyVault, using AKS Managed Identity
                    (<a target="_new" href="https://docs.microsoft.com/en-us/azure/aks/csi-secrets-store-driver">docs</a>)
                </Label>
                <ChoiceGroup
                    styles={{ root: { marginLeft: '50px' } }}
                    selectedKey={addons.csisecret}
                    options={[
                        { key: 'none', text: 'No, I am happy to use the default Kubernetes secret storage, or I will configure my own solution' },
                        { key: 'akvExist', text: 'Yes, store secrets in an existing KeyVault & enable Secrets Store CSI Driver' },
                        { key: 'akvNew', text: 'Yes, provision a new Azure KeyVault & enable Secrets Store CSI Driver' }
                    ]}
                    onChange={(ev, { key }) => updateFn("csisecret", key)}
                />
            </Stack.Item>

            {addons.csisecret !== 'none' &&
                <Stack.Item align="center" styles={{ root: { minWidth: '700px' } }} >
                    {addons.csisecret === "akvExist" &&
                        <TextField styles={{ root: { marginBottom: '20px' } }} value={addons.kvId} onChange={(ev, v) => updateFn("kvId", v)} errorMessage={getError(invalidArray, 'kvId')} required placeholder="Resource Id" label={<Text style={{ fontWeight: 600 }}>Enter your Azure Key Vault Resource Id</Text>} />
                    }

                    <Dropdown
                        styles={{ root: { marginBottom: '20px' } }}
                        label="Rotation poll interval"
                        onChange={(ev, { key }) => updateFn("keyVaultAksCSIPollInterval", key)} selectedKey={addons.keyVaultAksCSIPollInterval}
                        options={[
                            { key: '2m', text: '2 minutes' },
                            { key: '5m', text: '5 minutes' },
                            { key: '10m', text: '10 minutes' },
                            { key: '30m', text: '30 minutes' }
                        ]}
                    />

                    <MessageBar messageBarType={MessageBarType.info} styles={{ root: { width: '700px' } }}>
                        Secrets Store CSI Driver secret rotation will be enabled by default, periodically updating pod mounts and the Kubernetes Secrets. For more information see <Link target="_blank" href="https://docs.microsoft.com/en-us/azure/aks/csi-secrets-store-driver#enable-and-disable-autorotation">here</Link>.
                        <ol>
                            <li>Application will need to watch for changes from the mounted Kubernetes Secret volume or the CSI driver volume.</li>
                            <li>To get the latest secret as an environment variable use something like <Link target="_blank" href="https://github.com/stakater/Reloader">Reloader</Link> to watch for changes on the synced Kubernetes secret.</li>
                        </ol>
                    </MessageBar>
                </Stack.Item>
            }

            <Stack.Item align="start">
                <Label required={true}>
                    CSI Blob storage: Enable BlobFuse or NFS v3 access to Azure Blob Storage
                    (<a target="_new" href="https://docs.microsoft.com/azure/aks/azure-blob-csi">docs</a>)
                </Label>
                <Checkbox
                    styles={{ root: { marginLeft: "50px" } }}
                    inputProps={{ "data-testid": "addons-blob-csi-checkbox" }}
                    checked={addons.blobCSIDriver}
                    onChange={(ev, v) => updateFn("blobCSIDriver", v)}
                    label="Install the Azure Blob CSI Driver"
                />
            </Stack.Item>

            <Stack.Item align="start">
                <Label required={true}>
                    CSI File storage: Enable Driver to access Azure File Storage
                    (<a target="_new" href="https://learn.microsoft.com/azure/aks/azure-files-dynamic-pv">docs</a>)
                </Label>
                <Checkbox
                    styles={{ root: { marginLeft: "50px" } }}
                    inputProps={{ "data-testid": "addons-file-csi-checkbox" }}
                    checked={addons.fileCSIDriver}
                    onChange={(ev, v) => updateFn("fileCSIDriver", v)}
                    label="Install the Azure File CSI Driver"
                />
            </Stack.Item>

            <Stack.Item align="start">
                <Label required={true}>
                    CSI Disk storage: Enable Driver to access Azure Disk Storage
                    (<a target="_new" href="https://learn.microsoft.com/azure/aks/azure-disks-dynamic-pv">docs</a>)
                </Label>
                <Checkbox
                    styles={{ root: { marginLeft: "50px" } }}
                    inputProps={{ "data-testid": "addons-disk-csi-checkbox" }}
                    checked={addons.diskCSIDriver}
                    onChange={(ev, v) => updateFn("diskCSIDriver", v)}
                    label="Install the Azure Disk CSI AddOn"
                />
            </Stack.Item>

            <Separator className="notopmargin" />

            <Stack.Item align="start">
                <Label required={true}>
                    KEDA : Enable Kubernetes Event-driven Autoscaling (KEDA) on the AKS Cluster (<a target="_new" href="https://learn.microsoft.com/en-us/azure/aks/keda-deploy-add-on-arm#prerequisites">*preview</a>)
                    (<a target="_new" href="https://docs.microsoft.com/en-us/azure/aks/keda-about">docs</a>)
                </Label>
                <Checkbox styles={{ root: { marginLeft: '50px' } }} checked={addons.kedaAddon} onChange={(ev, v) => updateFn("kedaAddon", v, 'https://learn.microsoft.com/azure/aks/keda-deploy-add-on-arm#prerequisites')} label="Install the KEDA AddOn" />
            </Stack.Item>

            <Separator className="notopmargin" />

            <Stack.Item align="start">
                <Label required={true}>
                    Open Service Mesh : Enable Open Service Mesh on the AKS Cluster
                    (<a target="_new" href="https://docs.microsoft.com/azure/aks/open-service-mesh-about">docs</a>)
                </Label>
                <Checkbox styles={{ root: { marginLeft: '50px' } }} inputProps={{ "data-testid": "addons-osm-Checkbox"}} checked={addons.openServiceMeshAddon} onChange={(ev, v) => updateFn("openServiceMeshAddon", v)} label="Install the Open Service Mesh AddOn" />
            </Stack.Item>

            <Separator className="notopmargin" />

            <Stack.Item align="start">
                <Label required={true}>
                    Workload Identity : Enable Azure Workload Identity on the AKS Cluster
                    (<a target="_new" href="https://learn.microsoft.com/en-us/azure/aks/workload-identity-deploy-cluster">*preview</a>)
                    (<a target="_new" href="https://github.com/Azure/azure-workload-identity">project</a>)
                </Label>
                <Checkbox styles={{ root: { marginLeft: '50px' } }} inputProps={{ "data-testid": "addons-workloadIdentity-Checkbox"}} checked={addons.workloadIdentity} onChange={(ev, v) => updateFn("workloadIdentity", v)} label="Install Workload Identity" />
            </Stack.Item>

            <Separator className="notopmargin" />

            <Stack.Item align="start">
                <Label required={true}>
                    GitOps with Flux
                    (<a target="_new" href="https://docs.microsoft.com/azure/azure-arc/kubernetes/conceptual-gitops-flux2">docs</a>)
                </Label>
                <MessageBar messageBarType={MessageBarType.info} styles={{ root: { marginBottom: '10px' } }}>
                        Enabling this option installs Flux to the cluster, but it doesn't apply configuration.
                        For samples of Flux configuration see <Link target="_target" href="https://github.com/Azure/AKS-Construction/tree/main/samples/flux">Flux samples</Link>
                </MessageBar>
                <Checkbox styles={{ root: { marginLeft: '50px' } }} inputProps={{ "data-testid": "addons-gitops-checkbox"}} checked={addons.fluxGitOpsAddon} onChange={(ev, v) => updateFn("fluxGitOpsAddon", v)} label="Install the Flux GitOps AddOn" />

            </Stack.Item>

            <Separator className="notopmargin" />

            <Stack.Item align="start">
                <Label required={true}>
                    dapr (Distributed Application Runtime)
                    (<a target="_new" href="https://docs.microsoft.com/en-us/azure/aks/dapr">docs</a>)
                </Label>
                <MessageBar messageBarType={MessageBarType.info} styles={{ root: { marginBottom: "10px" } }}>
                    Enabling this option installs dapr, but doesn't apply configuration
                </MessageBar>
                <Checkbox
                    styles={{ root: { marginLeft: "50px" } }}
                    inputProps={{ "data-testid": "addons-dapr-checkbox" }}
                    checked={addons.daprAddon}
                    onChange={(ev, v) => updateFn("daprAddon", v)}
                    label="Install the Dapr AddOn"
                />
                <Checkbox
                    disabled={!addons.daprAddon}
                    styles={{ root: { marginLeft: "50px" } }}
                    inputProps={{ "data-testid": "addons-dapr-ha-checkbox" }}
                    checked={addons.daprAddonHA}
                    onChange={(ev, v) => updateFn("daprAddonHA", v)}
                    label="Enable high availability mode"
                />
            </Stack.Item>


            <Separator className="notopmargin" />

            <Stack.Item align="start">
                <Label required={true}>
                    Confidential Computing
                    (<a target="_new" href="https://learn.microsoft.com/azure/confidential-computing/confidential-enclave-nodes-aks-get-started">docs</a>)
                </Label>
                <MessageBar messageBarType={MessageBarType.info} styles={{ root: { marginBottom: "10px" } }}>
                    Enabling this option installs the SGX Device Plugin, but will require a node pool using a VM SKU that supports SGX. Choose `SGX Enclave` for the compute on the cluster tab.
                </MessageBar>
                <Checkbox
                    styles={{ root: { marginLeft: "50px" } }}
                    inputProps={{ "data-testid": "addons-sgx-checkbox" }}
                    checked={addons.sgxPlugin}
                    onChange={(ev, v) => updateFn("sgxPlugin", v)}
                    label="Install the sgxPlugin on compatible VM node pools"
                    disabled={cluster.computeType !== 'sgx'}
                />
            </Stack.Item>

        </Stack>
    );
}
