import type { __BuiltRoute } from "../router/types.ts";

export interface TrieNode {
	children: { [key: string]: TrieNode };
	dynamicChild: TrieNode | null;
	wildcardChild: TrieNode | null;
	route: __BuiltRoute | null;
	paramName: string | null;
	isWildcard: boolean;
}
