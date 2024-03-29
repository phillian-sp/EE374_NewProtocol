import { logger } from "./logger";
import { network } from "./network";

const BIND_PORT = 18018;
const BIND_IP = "45.32.133.136";

logger.info(`Malibu - A Marabu node`);
logger.info(`Dionysis Zindros <dionyziz@stanford.edu>`);

async function main() {
  network.init(BIND_PORT, BIND_IP);
}

main();
