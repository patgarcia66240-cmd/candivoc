// 🎯 Hooks utilitaires pour React Query
import { useQueryOptions as useOriginalQueryOptions, useMutationOptions as useOriginalMutationOptions } from '../../../providers/ReactQueryProvider'

// Réexporter les hooks depuis le provider pour éviter les avertissements React Refresh
export const useQueryOptions = useOriginalQueryOptions
export const useMutationOptions = useOriginalMutationOptions