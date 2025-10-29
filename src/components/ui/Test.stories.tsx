import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Test',
  component: 'div',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <div>Hello World</div>,
};