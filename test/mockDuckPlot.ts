import { vi } from "vitest";
import { DuckPlot } from "../src";
import { options } from "../examples/plots";

export function createMockDuckPlot(): {
  instance: DuckPlot;
  optionsStore: Record<string, any>;
} {
  const optionsStore: Record<string, any> = {};

  const mockDuckPlot: Partial<DuckPlot> = {
    options: vi.fn().mockImplementation((opts: any) => {
      Object.assign(optionsStore, opts); // Store the options
      return mockDuckPlot; // Allow chaining
    }),
    derivePlotOptions: vi.fn().mockImplementation(async () => ({
      ...optionsStore,
      width: optionsStore.width ?? 500, // Default width
      height: optionsStore.height ?? 400, // Default height
    })),
    config: vi.fn().mockReturnValue({}), // Mock config if needed
    sorts: vi.fn().mockReturnValue({}), // Mock config if needed
    data: vi.fn().mockReturnValue([]), // Mock config if needed
  };

  return { instance: mockDuckPlot as DuckPlot, optionsStore };
}
