import { describe, expect, it, vi, beforeEach } from "vitest";

class MockResource {
  attributes: Record<string, unknown>;
  constructor(attributes: Record<string, unknown>) {
    this.attributes = attributes;
  }
  merge() {
    return this;
  }
}

class MockExporter {
  options: Record<string, unknown>;
  constructor(options: Record<string, unknown>) {
    this.options = options;
  }
}

class MockMetricReader {
  options: Record<string, unknown>;
  constructor(options: Record<string, unknown>) {
    this.options = options;
  }
}

class MockNodeSDK {
  opts: Record<string, unknown>;
  constructor(opts: Record<string, unknown>) {
    this.opts = opts;
  }
  async start() {}
  async shutdown() {}
}

vi.mock("@opentelemetry/resources", () => ({ Resource: MockResource }));
vi.mock("@opentelemetry/exporter-trace-otlp-http", () => ({ OTLPTraceExporter: MockExporter }));
vi.mock("@opentelemetry/exporter-metrics-otlp-http", () => ({ OTLPMetricExporter: MockExporter }));
vi.mock("@opentelemetry/sdk-metrics", () => ({ PeriodicExportingMetricReader: MockMetricReader }));
vi.mock("@opentelemetry/sdk-node", () => ({ NodeSDK: MockNodeSDK }));
vi.mock("@opentelemetry/auto-instrumentations-node", () => ({
  getNodeAutoInstrumentations: vi.fn(() => []),
}));
vi.mock("@opentelemetry/api", () => ({
  diag: { setLogger: vi.fn() },
  DiagConsoleLogger: class {},
  DiagLogLevel: { INFO: "INFO" },
}));

const { createTelemetrySDK, parseOtlpHeaders } = await import("./otel");
const { SemanticResourceAttributes } = await import("@opentelemetry/semantic-conventions");

describe("parseOtlpHeaders", () => {
  it("parses multi-value header strings", () => {
    const headers = parseOtlpHeaders("Authorization=Basic abc123, X-Custom=foo=bar");
    expect(headers).toEqual({ Authorization: "Basic abc123", "X-Custom": "foo=bar" });
  });

  it("returns empty object for missing string", () => {
    expect(parseOtlpHeaders()).toEqual({});
  });
});

describe("createTelemetrySDK", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes resource attributes and exporters to NodeSDK", () => {
    const sdk = createTelemetrySDK({
      serviceName: "test-service",
      serviceVersion: "1.2.3",
      environment: "staging",
      otlpEndpoint: "http://collector:4318",
      otlpHeaders: "Authorization=Basic abc",
    }) as unknown as MockNodeSDK;

    expect(sdk).toBeInstanceOf(MockNodeSDK);
    const resource = sdk.opts.resource as MockResource;
    expect(resource.attributes[SemanticResourceAttributes.SERVICE_NAME]).toBe("test-service");
    expect(resource.attributes[SemanticResourceAttributes.SERVICE_VERSION]).toBe("1.2.3");
    expect(resource.attributes[SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]).toBe("staging");

    const traceExporter = sdk.opts.traceExporter as MockExporter;
    expect(traceExporter.options).toMatchObject({
      url: "http://collector:4318/v1/traces",
      headers: { Authorization: "Basic abc" },
    });

    const metricReader = sdk.opts.metricReader as MockMetricReader;
    expect(metricReader.options.exporter.options.url).toBe("http://collector:4318/v1/metrics");
  });
});

