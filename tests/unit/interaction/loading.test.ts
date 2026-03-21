import { ILoading } from '@/interaction/loading';

describe('ILoading', () => {
  let mockLoading: ILoading;
  let startCalled: boolean;
  let stopCalled: boolean;
  let progressUpdates: number[];

  beforeEach(() => {
    startCalled = false;
    stopCalled = false;
    progressUpdates = [];

    mockLoading = {
      start: async () => {
        startCalled = true;
        mockLoading.inProgress = true;
      },
      stop: async () => {
        stopCalled = true;
        mockLoading.inProgress = false;
      },
      updateProgress: async (progressPercent: number) => {
        progressUpdates.push(progressPercent);
      },
      inProgress: false,
    };
  });

  it('should have correct interface properties', () => {
    expect(mockLoading).toHaveProperty('start');
    expect(mockLoading).toHaveProperty('stop');
    expect(mockLoading).toHaveProperty('updateProgress');
    expect(mockLoading).toHaveProperty('inProgress');
    expect(typeof mockLoading.start).toBe('function');
    expect(typeof mockLoading.stop).toBe('function');
    expect(typeof mockLoading.updateProgress).toBe('function');
    expect(typeof mockLoading.inProgress).toBe('boolean');
  });

  it('should start loading process', async () => {
    expect(mockLoading.inProgress).toBe(false);
    await mockLoading.start();
    expect(startCalled).toBe(true);
    expect(mockLoading.inProgress).toBe(true);
  });

  it('should stop loading process', async () => {
    mockLoading.inProgress = true;
    await mockLoading.stop();
    expect(stopCalled).toBe(true);
    expect(mockLoading.inProgress).toBe(false);
  });

  it('should update progress', async () => {
    await mockLoading.updateProgress(50);
    expect(progressUpdates).toContain(50);
    await mockLoading.updateProgress(75);
    expect(progressUpdates).toEqual([50, 75]);
  });

  it('should handle multiple progress updates', async () => {
    await mockLoading.updateProgress(0);
    await mockLoading.updateProgress(25);
    await mockLoading.updateProgress(50);
    await mockLoading.updateProgress(75);
    await mockLoading.updateProgress(100);
    expect(progressUpdates).toEqual([0, 25, 50, 75, 100]);
  });
});