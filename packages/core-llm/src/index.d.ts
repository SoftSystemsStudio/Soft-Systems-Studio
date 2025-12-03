type ChatMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};
export declare function callChat(messages: ChatMessage[], model?: string): Promise<string>;
export type { ChatMessage };
export declare function callEmbeddings(input: string | string[], model?: string): Promise<number[][]>;
//# sourceMappingURL=index.d.ts.map