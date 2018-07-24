import querystring from 'querystring';

export function getParams () {
    const {addr, proposal} = querystring.parse(window.location.hash.slice(1));
    return {addr, proposal};
}

export function getUrlForProposal (proposal) {
    const {addr} = getParams();
    return window.location.href.split('#')[0]+'#'+querystring.encode({addr, proposal});
}

export function getUrlForOrganization (addr) {
    return window.location.href.split('#')[0]+'#'+querystring.encode({addr});
}
