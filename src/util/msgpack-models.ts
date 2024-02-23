import { CustomConverter, MessagePackObject, key, array, type } from './msgpack-serializer';

export const HexConverter = new CustomConverter<Uint8Array, string>(convertUint8ArrayToHex);

export type EncodedDate = [unixTimeSeconds: number, offsetMinutes: number];
const DateConverter = new CustomConverter<EncodedDate, Date>(([unixTimeSeconds, offsetMinutes]) => new Date((unixTimeSeconds * 1000) + (offsetMinutes * 60 * 1000)));

type long = bigint;
type bool = boolean;

export class Graphic extends MessagePackObject {
    @key(0) readonly Name!: string;
    @key(1) readonly Image!: string;
}

export class Endoom extends MessagePackObject {
    @key(0) readonly Name!: string;
    @key(1) readonly Filename!: string;
    @key(2) readonly Text!: string;
}

export class NiceNames extends MessagePackObject {
    @key(0) readonly LevelName!: string;
    @key(1) readonly Par!: string | null;
    @key(2) readonly Author!: string | null;
}

export class Map extends MessagePackObject {
    @key(0) readonly Name!: string;
    @key(1) @type(NiceNames) readonly NiceNames!: NiceNames | null;
    @key(2) @type(array(NiceNames)) readonly FallbackNiceNames!: NiceNames[];
    @key(3) readonly Format!: MapFormat;
    @key(4) readonly Things!: number;
    @key(5) readonly Sidedefs!: number;
    @key(6) readonly Linedefs!: number;
    @key(7) readonly Vertexes!: number;
    @key(8) readonly DeathmatchSpawns!: number;
    @key(9) readonly SingeplayerSpawns!: number;
    @key(10) readonly CoopSpawns!: number;
    @key(11) readonly Corrupt!: bool;
    @key(12) readonly CorruptMessage!: string | null;
    @key(13) readonly HasAutomapImage!: bool;
    @key(14) readonly Screenshot!: string | null;
}

export class Wad extends MessagePackObject {
    @key(0) @type(HexConverter) readonly Id!: string;
    @key(1) readonly Name!: string | null;
    @key(2) readonly FallbackNames!: string[];
    @key(3) readonly Filename!: string | null;
    @key(4) readonly FallbackFilenames!: string[];
    @key(5) @type(HexConverter) readonly Sha1!: string;
    @key(6) @type(HexConverter) readonly Md5!: string;
    @key(7) @type(HexConverter) readonly Sha256!: string;
    @key(8) readonly Size!: long;
    @key(9) readonly Type!: WadType;
    @key(10) readonly IsCorrupt!: bool;
    @key(11) readonly CorruptMessage!: string;
    @key(12) @type(DateConverter) readonly LastUpdated!: Date | null;
    @key(13) @type(DateConverter) readonly DateAdded!: Date | null;
    @key(14) readonly CountsEndoom!: number | null;
    @key(15) readonly CountsMaps!: number | null;
    @key(16) readonly CountsPalettes!: number | null;
    @key(17) readonly CountsGraphics!: number | null;
    @key(18) readonly CountsLumps!: number | null;
    @key(19) readonly Engines!: string[];
    @key(20) readonly Iwads!: string[];
    @key(21) readonly Readmes!: string[];
    @key(22) readonly Description!: string | null;
    @key(23) readonly FallbackDescriptions!: string[] | null;
    @key(24) readonly IsLocked!: bool;
    @key(25) readonly CanDownload!: bool;
    @key(26) readonly IsAdult!: bool;
    @key(27) readonly IsHidden!: bool;
    @key(28) readonly Categories!: string[];
    @key(29) readonly Palettes!: Record<string, string[]>;
    @key(30) @type(array(Graphic)) readonly Graphics!: Graphic[];
    @key(31) @type(array(Endoom)) readonly Endooms!: Endoom[];
    @key(32) @type(array(Map)) readonly Maps!: Map[];
    @key(33) readonly LumpsInfoIndex!: [number, number] | null;
    @key(34) readonly CanonicalFilename!: string;
    @key(35) readonly IdSmall!: string;
}

export class Lump extends MessagePackObject {
    @key(0) readonly Name!: string;
    @key(1) readonly Size!: number;
    @key(2) readonly Type!: number;
    @key(3) readonly Corrupt!: bool;
    @key(4) readonly Compressed!: bool;
    @key(5) @type(HexConverter) readonly Sha1!: string;
    @key(6) @type(HexConverter) readonly Md5!: string;
    @key(7) @type(HexConverter) readonly Sha256!: string;
}

export class WadLumps extends MessagePackObject {
    @key(0) @type(HexConverter) readonly Id!: string;
    @key(1) readonly Count!: number;
    @key(2) readonly CorruptCount!: number;
    @key(3) @type(array(Lump)) readonly Lumps!: Lump[];
}

export const enum MapFormat {
    DOOM = 'DOOM',
    HEXEN = 'HEXEN',
    DOOM64 = 'DOOM64',
    TEXTMAP = 'TEXTMAP',
}

export const enum WadType {
    IWAD = 'IWAD',
    PWAD = 'PWAD',
    ZWAD = 'ZWAD',
    WAD2 = 'WAD2',
    WAD3 = 'WAD3',
    PK3 = 'PK3',
    PK7 = 'PK7',
    PKZ = 'PKZ',
    EPK = 'EPK',
    PKE = 'PKE',
    UNKNOWN = 'UNKNOWN',
}

//! https://stackoverflow.com/a/34310051
export function convertUint8ArrayToHex(value: Uint8Array): string {
    const hexArray: string[] = new Array(value.length);
    for (let i = 0; i < value.length; i++) {
        hexArray[i] = (value[i] & 0xFF).toString(16).padStart(2, '0');
    }
    return hexArray.join('');
}