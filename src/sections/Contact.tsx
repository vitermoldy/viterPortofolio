import { VoxelStage } from '@/components/voxel/VoxelStage'
import type { LoadState } from '@/data/profile'
import { day } from '@/lib/format'
import { asset } from '@/lib/utils'

// The same links as the "Connect with me" row of the profile README.
const LINKS = [
  { label: 'GitHub', value: 'github.com/vitermoldy', href: 'https://github.com/vitermoldy' },
