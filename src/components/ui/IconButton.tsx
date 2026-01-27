import React from "react";
import { IconButton as MuiIconButton, IconButtonProps } from "@mui/material";

type Props = IconButtonProps & {
  "aria-label": string;
};

export default function IconButton({ children, className, ...rest }: Props) {
  return (
    <MuiIconButton className={className} {...rest}>
      {children}
    </MuiIconButton>
  );
}
