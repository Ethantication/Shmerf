import { GdeltConnector } from "./gdelt";
import { ReliefWebConnector } from "./reliefweb";
import { EonetConnector } from "./eonet";
import { UsgsConnector } from "./usgs";
import { OpenMeteoConnector } from "./openmeteo";
import { NoaaConnector } from "./noaa";
import { OpenSkyConnector } from "./opensky";
import { WorldBankConnector } from "./worldbank";

export const connectors = [
  new GdeltConnector(),
  new ReliefWebConnector(),
  new EonetConnector(),
  new UsgsConnector(),
  new OpenMeteoConnector(),
  new NoaaConnector(),
  new OpenSkyConnector(),
  new WorldBankConnector(),
];

export const connectorMap = Object.fromEntries(connectors.map((connector) => [connector.provider, connector]));
