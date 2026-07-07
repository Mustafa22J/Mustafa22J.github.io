/* facility-route.js — C0: centralized facility route map.
   Replaces scattered chapterZ = -6 - i*15 with one maintainable structure. The OSI journey
   is expanded to seven physical stations (indices 2..8) that occupy far more distance than a
   normal chapter; later portfolio sections shift safely behind them. Also the single source of
   truth for OSI layer content (preserved verbatim from the accepted v4 accordion). */
window.FacilityStations = window.FacilityStations || {};
(function (NS, W) {
  'use strict';

  // ordered facility nodes (DOM chapter order after the 6 OSI sub-chapters are injected)
  var NODES = [
    { id: 'hero',            domId: 'hero',    side: -1, kind: 'hero' },
    { id: 'about',           domId: 'about',   side:  1, kind: 'about' },
    { id: 'osi',             domId: 'osi',     side: -1, kind: 'osi' },   // one consolidated OSI bay (all 7 layers)
    { id: 'skills',          domId: 'skills',  side:  1, kind: 'chapter' },
    { id: 'education',       domId: 'education',side: -1, kind: 'chapter' },
    { id: 'projects',        domId: 'projects', side: 1, kind: 'chapter' },
    { id: 'troubleshooting', domId: 'troubleshooting', side: -1, kind: 'chapter' },
    { id: 'experience',      domId: 'experience', side: 1, kind: 'chapter' },
    { id: 'certifications',  domId: 'certifications', side: -1, kind: 'chapter' },
    { id: 'lab',             domId: 'lab',     side:  1, kind: 'chapter' },
    { id: 'resume',          domId: 'resume',  side: -1, kind: 'chapter' },
    { id: 'contact',         domId: 'contact', side:  1, kind: 'chapter' }
  ];

  // world Z for each node: hero/about normal, OSI stations at 14u spacing, chapters at 15u.
  var z = [], cur = -6;
  NODES.forEach(function (n, i) {
    if (i === 0) { cur = -6; }
    else if (n.kind === 'osi') { cur -= 18; }     // a little extra room for the OSI bay
    else { cur -= 15; }
    z.push(cur); n.z = cur; n.i = i;
  });

  // OSI layer content — verbatim from the accepted v4 accordion (verified, real experience).
  var OSI_LAYERS = {
    1: { name: 'Physical', pdu: 'Bits', acc: '#e08a6f', node: 'osiPhysical',
         summary: 'Raw transmission of bits over copper and fibre — connectors, transceivers, signalling.',
         a: ['Cat5e/6 copper', 'Fibre (SMF/MMF)', 'RJ45 · SFP', 'PoE', 'Patch panels', 'Transceivers'],
         aTitle: 'Media · Devices',
         work: "Built and tested T568B Ethernet cables, verified physical interfaces and link status, and diagnosed NIC/cabling faults during hardware labs.",
         equip: 'fibre distribution · RJ45 patch · SFP/SFP+ · cable test' },
    2: { name: 'Data Link', pdu: 'Frame', acc: '#e6b84f', node: 'osiDataLink',
         summary: 'Node-to-node delivery on the same network: framing, MAC addressing, media access. Switches live here.',
         a: ['Ethernet · ARP', 'VLANs · 802.1Q', 'STP/RSTP', 'DHCP snooping', 'Port security', 'BPDU guard'],
         aTitle: 'Technologies · Security',
         work: "Configured VLANs, 802.1Q trunking, and STP; deployed DHCP snooping with trusted/untrusted ports to block rogue DHCP servers.",
         equip: '48-port access switches · trunk uplinks · MAC table' },
    3: { name: 'Network', pdu: 'Packet', acc: '#5cd98a', node: 'osiNetwork',
         summary: 'Logical addressing and routing between networks. Routers forward on IP and the routing table.',
         a: ['IPv4/IPv6', 'ICMP', 'OSPFv2', 'NAT/PAT', 'ACLs', 'ping · traceroute', 'show ip route'],
         aTitle: 'Protocols · Troubleshoot',
         work: "Configured OSPFv2, NAT/PAT, standard & extended ACLs, and ROAS across multi-router Cisco topologies; subnetted IPv4 plans end to end.",
         equip: 'L3 switch · routers · routing table · OSPF adjacency' },
    4: { name: 'Transport', pdu: 'Segment / Datagram', acc: '#4fd6c8', node: 'osiTransport',
         summary: 'End-to-end delivery: segmentation, flow control, reliability (TCP) vs speed (UDP). Ports identify the service.',
         a: ['TCP (3-way handshake)', 'UDP', 'Ports · Sockets', 'Test-NetConnection', 'netstat / ss', 'nmap'],
         aTitle: 'Protocols · Troubleshoot',
         work: "Built iptables port-filtering policy, configured PAT / static port-forwarding, and validated SMTP with telnet to port 25 plus ss/netstat checks.",
         equip: 'stateful firewall · load balancer · session table' },
    5: { name: 'Session', pdu: 'Data', acc: '#7f9cf0', node: 'osiSession',
         summary: 'Establishes, manages and tears down sessions between applications — the dialogue controller.',
         a: ['Sockets', 'RPC', 'NetBIOS', 'Session tokens', 'Timeouts'],
         aTitle: 'Commonly associated concepts',
         work: "Validated authenticated sessions across SSH, Outlook Web App logins, and Samba/SMB shares in mixed Windows/Linux environments.",
         equip: 'session controller · auth broker · socket table' },
    6: { name: 'Presentation', pdu: 'Data', acc: '#a98cf0', node: 'osiPresentation',
         summary: 'Translation, encryption and compression — how data is represented on the wire. TLS is associated here though it spans L4–L7.',
         a: ['TLS/SSL', 'Encoding', 'JPEG/PNG', 'Serialization', 'TLS 1.2/1.3', 'Cert validation'],
         aTitle: 'Technologies · Security',
         work: "Configured Apache SSL virtual hosts and worked with certificate-services concepts (AD CS) in Windows enterprise labs.",
         equip: 'TLS gateway · certificate status · encode/compress' },
    7: { name: 'Application', pdu: 'Data', acc: '#e07fd0', node: 'osiApplication',
         summary: 'Where network-facing services expose their interfaces — software requests and consumes network resources.',
         a: ['HTTP/HTTPS', 'DNS', 'DHCP', 'SSH', 'SMTP/IMAP/POP3', 'SNMP', 'LDAP'],
         aTitle: 'Protocols',
         work: "Stood up BIND DNS, Apache virtual hosts, Postfix mail, and Exchange 2019 (OWA + SMTP/POP/IMAP); hardened SSH across Linux service labs.",
         equip: 'DNS · DHCP · Web · SSH · Mail · SNMP · NTP cluster' }
  };

  W.FACILITY_ROUTE = {
    nodes: NODES, z: z, count: NODES.length,
    byId: NODES.reduce(function (m, n) { m[n.id] = n; return m; }, {}),
    osi: OSI_LAYERS,
    osiIndexFor: function (layer) { return 1 + layer; },   // chapter index of an OSI layer (L1->2 ... L7->8)
    zAt: function (cf) {                                     // interpolated world Z at a float chapter
      var lo = Math.max(0, Math.min(z.length - 1, Math.floor(cf)));
      var hi = Math.max(0, Math.min(z.length - 1, Math.ceil(cf)));
      var f = cf - Math.floor(cf);
      return z[lo] + (z[hi] - z[lo]) * f;
    }
  };

  // C0 structural validation — non-intrusive (console + window.__routeCheck), no overlay.
  (function validate() {
    var errs = [], seen = {};
    var expected = ['hero', 'about', 'osi', 'skills', 'education', 'projects',
      'troubleshooting', 'experience', 'certifications', 'lab', 'resume', 'contact'];
    if (NODES.length !== 12) errs.push('expected 12 nodes, got ' + NODES.length);
    NODES.forEach(function (n, i) {
      if (seen[n.id]) errs.push('duplicate id ' + n.id); seen[n.id] = 1;
      if (!isFinite(n.z)) errs.push('non-finite z at ' + n.id);
      if (n.side !== -1 && n.side !== 1) errs.push('invalid side at ' + n.id);
      if (expected[i] !== n.id) errs.push('order mismatch @' + i + ': ' + n.id + ' != ' + expected[i]);
      if (i > 0 && !(n.z < NODES[i - 1].z)) errs.push('non-monotonic z at ' + n.id);
      if (i > 0 && Math.abs(n.z - NODES[i - 1].z) < 8) errs.push('overlap: ' + NODES[i - 1].id + '/' + n.id);
    });
    W.__routeCheck = { ok: errs.length === 0, count: NODES.length, errors: errs,
      order: NODES.map(function (n) { return n.id; }),
      osiZ: NODES.filter(function (n) { return n.kind === 'osi'; }).map(function (n) { return { id: n.id, z: n.z }; }) };
    (errs.length ? console.warn : console.log)('[route] C0 validation ' + (W.__routeCheck.ok ? 'OK (18 nodes)' : 'FAILED'), errs);
  })();
})(window.FacilityStations, window);
