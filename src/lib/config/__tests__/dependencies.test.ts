/**
 * Test file to verify enhanced dependencies are properly configured
 */

describe("Enhanced Dependencies Configuration", () => {
  it("should import Framer Motion configuration", async () => {
    const motionConfig = await import("../motion");
    expect(motionConfig.professionalAnimations).toBeDefined();
    expect(motionConfig.fadeInUp).toBeDefined();
    expect(motionConfig.transitions).toBeDefined();
  });

  it("should import Recharts configuration", async () => {
    const chartsConfig = await import("../charts");
    expect(chartsConfig.chartColors).toBeDefined();
    expect(chartsConfig.chartStyles).toBeDefined();
    expect(chartsConfig.chartFormatters).toBeDefined();
  });

  it("should import React Spring configuration", async () => {
    const springsConfig = await import("../springs");
    expect(springsConfig.springPresets).toBeDefined();
    expect(springsConfig.springAnimations).toBeDefined();
    expect(springsConfig.professionalSprings).toBeDefined();
  });

  it("should import Orbiter Finance configuration", async () => {
    const orbiterConfig = await import("../orbiter");
    expect(orbiterConfig.orbiterConfig).toBeDefined();
    expect(orbiterConfig.orbiterUtils).toBeDefined();
    expect(orbiterConfig.orbiterThresholds).toBeDefined();
  });

  it("should import Hop Protocol configuration", async () => {
    const hopConfig = await import("../hop");
    expect(hopConfig.hopConfig).toBeDefined();
    expect(hopConfig.hopUtils).toBeDefined();
    expect(hopConfig.hopThresholds).toBeDefined();
  });

  it("should have proper TypeScript interfaces", async () => {
    const orbiterConfig = await import("../orbiter");
    const hopConfig = await import("../hop");
    
    // Test that interfaces are properly exported
    expect(typeof orbiterConfig.orbiterUtils.calculateTier).toBe("function");
    expect(typeof hopConfig.hopUtils.calculateTier).toBe("function");
  });
});