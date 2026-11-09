import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Helper component that throws an error
const ProblemChild = () => {
  throw new Error('Test crash error');
};

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Content is safe</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Content is safe')).toBeInTheDocument();
  });

  it('renders fallback UI when child throws an error', () => {
    // Suppress console.error from ErrorBoundary logging during test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('เกิดข้อผิดพลาดขึ้นในระบบ')).toBeInTheDocument();
    expect(screen.getByText('โหลดหน้าใหม่')).toBeInTheDocument();
    expect(screen.getByText('กลับหน้าหลัก')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
