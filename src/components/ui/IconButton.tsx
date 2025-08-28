import React from 'react';
import { Button } from 'react-bootstrap';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  'aria-label': string;
  as?: any;
};

export default function IconButton({ children, className, ...rest }: Props) {
  return (
    <Button variant="link" className={className} {...rest} />
  );
}
