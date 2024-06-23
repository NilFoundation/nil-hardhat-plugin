import 'hardhat/types/config';

declare module 'hardhat/types/config' {
	import { HardhatUserConfig } from 'hardhat/types';

	export interface NilHardhatUserConfig extends HardhatUserConfig {
		walletAddress?: string;
	}

	interface HardhatConfig extends NilHardhatUserConfig {} // Augmenting existing type
}