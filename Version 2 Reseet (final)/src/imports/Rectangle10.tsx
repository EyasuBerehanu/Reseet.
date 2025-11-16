import Group6 from './Group6';

interface RectangleProps {
  receiptCount?: number;
}

export default function Rectangle({ receiptCount = 0 }: RectangleProps) {
  const isVisible = receiptCount >= 1;
  
  return (
    <div 
      className={`relative size-full transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
      style={{ top: '20px' }}
    >
      <Group6 />
    </div>
  );
}