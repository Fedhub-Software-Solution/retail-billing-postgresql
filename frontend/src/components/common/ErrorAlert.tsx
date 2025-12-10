import { Alert, AlertTitle, Button } from '@mui/material'
import { ErrorOutline, Refresh } from '@mui/icons-material'

interface ErrorAlertProps {
  title?: string
  message: string
  onRetry?: () => void
  severity?: 'error' | 'warning' | 'info'
}

const ErrorAlert = ({ title, message, onRetry, severity = 'error' }: ErrorAlertProps) => {
  return (
    <Alert
      severity={severity}
      icon={<ErrorOutline />}
      action={
        onRetry && (
          <Button color="inherit" size="small" startIcon={<Refresh />} onClick={onRetry}>
            Retry
          </Button>
        )
      }
      sx={{ m: 2 }}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  )
}

export default ErrorAlert

