import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { ProductCard } from '../ProductCard';

describe('ProductCard', () => {
  it('renders product information and link', () => {
    render(
      <MemoryRouter>
        <ProductCard
          id="1"
          title="Test Product"
          price={9.99}
          image="/test.jpg"
          category="Books"
          condition="good"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('Books')).toBeInTheDocument();

    const link = screen.getByRole('link') as HTMLAnchorElement;
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('/product/1');
  });
});
