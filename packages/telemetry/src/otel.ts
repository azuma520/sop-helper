import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

export interface TelemetryOptions {
  serviceName?: string;
  serviceVersion?: string;
  environment?: string;
  otlpEndpoint?: string;
  otlpHeaders?: string;
  enableConsoleDiag?: boolean;
}

export const parseOtlpHeaders = (headerString?: string): Record<string, string> => {
  if (!headerString) {
    return {};
  }

  return headerString
    .split(/[;,]/)
    .map((pair) => pair.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, pair) => {
      const [rawKey, ...rawValue] = pair.split("=");
      if (!rawKey || rawValue.length === 0) {
        return acc;
      }
      const key = rawKey.trim();
      const value = rawValue.join("=").trim();
      if (key) {
        acc[key] = value;
      }
      return acc;
    }, {});
};

const sanitizeEndpoint = (endpoint: string) => endpoint.replace(/\/$/, "");

export const createTelemetrySDK = (options: TelemetryOptions = {}): NodeSDK => {
  const {
    serviceName = process.env.OTEL_SERVICE_NAME ?? "ai-sop-service",
    serviceVersion =
      options.serviceVersion ?? process.env.OTEL_SERVICE_VERSION ?? process.env.npm_package_version ?? "0.0.1",
    environment = process.env.OTEL_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
    otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318",
    otlpHeaders = process.env.OTEL_EXPORTER_OTLP_HEADERS,
    enableConsoleDiag = process.env.OTEL_DIAG_LOGGER === "console" || options.enableConsoleDiag,
  } = options;

  if (enableConsoleDiag) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
  }

  const endpoint = sanitizeEndpoint(options.otlpEndpoint ?? otlpEndpoint);
  const headers = parseOtlpHeaders(options.otlpHeaders ?? otlpHeaders);

  const traceExporter = new OTLPTraceExporter({
    url: `${endpoint}/v1/traces`,
    headers,
  });

  const metricsExporter = new OTLPMetricExporter({
    url: `${endpoint}/v1/metrics`,
    headers,
  });

  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: environment,
  });

  const metricReader = new PeriodicExportingMetricReader({
    exporter: metricsExporter,
  });

  return new NodeSDK({
    resource,
    traceExporter,
    metricReader,
    instrumentations: [getNodeAutoInstrumentations()],
  });
};

export const startTelemetry = async (options: TelemetryOptions = {}): Promise<NodeSDK> => {
  const sdk = createTelemetrySDK(options);
  await sdk.start();
  return sdk;
};

export const shutdownTelemetry = async (sdk: NodeSDK) => {
  await sdk.shutdown();
};

