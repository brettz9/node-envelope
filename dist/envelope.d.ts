export = Envelope;
/**
 * @extends {Array}
 */
declare class Envelope extends Array<any> {
    /**
     * Parse an email
     * @param {Buffer|string} buffer
     * @param {Number} [offset=0]
     * @param {Number} [length]
     * @returns {Envelope}
     */
    static parse(buffer: Buffer | string, offset?: number, length?: number): Envelope;
    /**
     * Create a new Envelope
     * @param {Buffer|string} [value]
     */
    constructor(value?: Buffer | string);
    header: import("./header");
    body: string | Buffer<ArrayBufferLike> | Buffer<ArrayBuffer> | null;
    /**
     * Whether it is a multipart message
     * @return {boolean}
     */
    get isMultipart(): boolean;
    /**
     * @param {string} type
     * @param {boolean} [withDisposition=true]
     */
    getContent(type: string, withDisposition?: boolean): any;
    /**
     * Get the plaintext part of a message
     * @returns {string}
     */
    getText(): string;
    /**
     * Get the HTML part of a message
     * @returns {string}
     */
    getHTML(): string;
    /**
     * Get all attachments contained in the message
     * @param {boolean} [withInline=true] - Whether to include inline attachments
     * @returns {Array<Envelope>}
     */
    getAttachments(withInline?: boolean): Array<Envelope>;
    /**
     * Parse an email
     * @param {Buffer|string} buffer
     * @param {Number} [offset=0]
     * @param {Number} [length]
     * @returns {Envelope}
     */
    parse(buffer: Buffer | string, offset?: number, length?: number): Envelope;
}
declare namespace Envelope {
    let Header: typeof import("./header");
}
//# sourceMappingURL=envelope.d.ts.map