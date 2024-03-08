const RPCS = [
  {
    chain: 'ETH', rpc: 'https://rpc.ankr.com/eth', scan: 'https://etherscan.io', token: 'ETH',
  },
  {
    chain: 'ZKSYNC', rpc: 'https://rpc.ankr.com/zksync_era', scan: 'https://www.oklink.com/zksync', token: 'ETH',
  },
  {
    chain: 'ARBITRUM', rpc: 'https://arb1.arbitrum.io/rpc', scan: 'https://arbiscan.io', token: 'ETH',
  },
  {
    chain: 'NOVA', rpc: 'https://rpc.ankr.com/arbitrumnova', scan: 'https://nova.arbiscan.io', token: 'ETH',
  },
  {
    chain: 'OPTIMISM', rpc: 'https://rpc.ankr.com/optimism', scan: 'https://optimistic.etherscan.io', token: 'ETH',
  },
  {
    chain: 'SCROLL', rpc: 'https://rpc.ankr.com/scroll', scan: 'https://scrollscan.com', token: 'ETH',
  },
  {
    chain: 'BASE', rpc: 'https://1rpc.io/base', scan: 'https://basescan.org', token: 'ETH',
  },
  {
    chain: 'LINEA', rpc: 'https://1rpc.io/linea', scan: 'https://lineascan.build', token: 'ETH',
  },
  {
    chain: 'MANTA', rpc: 'https://1rpc.io/manta', scan: 'https://pacific-explorer.manta.network/', token: 'ETH',
  },
  {
    chain: 'ZORA', rpc: 'https://rpc.zora.energy', scan: 'https://explorer.zora.energy/', token: 'ETH',
  },
  {
    chain: 'ZKF', rpc: 'https://rpc.zkfair.io', scan: 'https://scan.zkfair.io', token: 'USDC',
  },
  {
    chain: 'BSC', rpc: 'https://rpc.ankr.com/bsc', scan: 'https://bscscan.com', token: 'BNB',
  },
  {
    chain: 'POLYGON', rpc: 'https://rpc.ankr.com/polygon', scan: 'https://polygonscan.com', token: 'MATIC',
  },
  {
    chain: 'AVAXC', rpc: 'https://avalanche.public-rpc.com', scan: 'https://snowtrace.io', token: 'AVAX',
  },
  {
    chain: 'FTM', rpc: 'https://rpc.ankr.com/fantom', scan: 'https://ftmscan.com', token: 'FTM',
  },
  {
    chain: 'CORE', rpc: 'https://rpc.coredao.org', scan: 'https://scan.coredao.org', token: 'CORE',
  },
  {
    chain: 'METIS', rpc: 'https://andromeda.metis.io/?owner=1088', scan: 'https://andromeda-explorer.metis.io', token: 'METIS',
  },
  {
    chain: 'GNOSIS', rpc: 'https://rpc.ankr.com/gnosis', scan: 'https://gnosisscan.io', token: 'XDAI',
  },
  {
    chain: 'CELO', rpc: 'https://rpc.ankr.com/celo', scan: 'https://celoscan.io', token: 'CELO',
  },
  {
    chain: 'HARMONY', rpc: 'https://rpc.ankr.com/harmony', scan: 'https://explorer.harmony.one', token: 'ONE',
  },
];

const ERALEND_LANDING = '0x22d8b71599e14f20a49a397b88c1c878c86f5579';
const ERALEND_COLLETERAL = '0xc955d5fa053d88e7338317cc6589635cd5b2cf09';
const ERALEND_BORROW_USDC = '0x90973213E2a230227BD7CCAfB30391F4a52439ee';

const NATIVE_TOKEN = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const INFINITY_APPROVE = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

const WETH_TOKEN_CONTRACT = '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91';
const USDC_TOKEN_ADDRESS = '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4';
const USDT_TOKEN_ADDRESS = '0x493257fd37edb34451f62edf8d2a0c418852ba4c';

const SYNCSWAP_ROUTER_CONTRACT = '0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295';
const SYNCSWAP_POOL_CONTRACT = '0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb';
const SYNCSWAP_STABLE_POOL_FACTORY = '0x5b9f21d407F35b10CbfDDca17D5D84b129356ea3';

const ZEROLEND_CONTRACT = '0x767b4A087c11d7581Ac95eaFfc1FeBFA26bad3d2';
const ZEROLEND_WETH = '0x9002ecb8a06060e3b56669c6B8F18E1c3b119914';

const REACTOR_FUSION_LENDING = '0xC5db68F30D21cBe0C9Eac7BE5eA83468d69297e6';
const REACTOR_FUSION_COLLETERAL = '0x23848c28af1c3aa7b999fa57e6b6e8599c17f3f2';

const ODOS_ROUTER_CONTRACT = '0x4bba932e9792a2b917d47830c93a9bc79320e4f7';

module.exports = {
  RPCS,
  NATIVE_TOKEN,
  INFINITY_APPROVE,
  WETH_TOKEN_CONTRACT,
  SYNCSWAP_POOL_CONTRACT,
  SYNCSWAP_ROUTER_CONTRACT,
  ZERO_ADDRESS,
  USDC_TOKEN_ADDRESS,
  USDT_TOKEN_ADDRESS,
  SYNCSWAP_STABLE_POOL_FACTORY,
  ERALEND_COLLETERAL,
  ERALEND_LANDING,
  ERALEND_BORROW_USDC,
  ZEROLEND_CONTRACT,
  ZEROLEND_WETH,
  REACTOR_FUSION_COLLETERAL,
  REACTOR_FUSION_LENDING,
  ODOS_ROUTER_CONTRACT,
};
