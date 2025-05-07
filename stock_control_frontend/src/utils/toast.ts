// src/utils/toast.ts
export function toastError(message: string): void {
    // aqui você pode trocar por um componente de Snackbar próprio
    alert(`Erro: ${message}`)
}
