import { Tooltip, tooltipClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

export const PersianTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    fontFamily: 'VazirMatn',
    fontSize: '0.875rem',
    lineHeight: 1.5
  },
});
