import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('renders 404 message and navigation buttons', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('ไม่พบหน้าที่คุณต้องการ')).toBeInTheDocument();
    expect(screen.getByText('ย้อนกลับ')).toBeInTheDocument();
    expect(screen.getByText('กลับหน้าหลัก')).toBeInTheDocument();
  });
});
