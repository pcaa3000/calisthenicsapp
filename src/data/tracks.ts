export interface Track {
  title: string;
  artist: string;
  url: string;
  dl?: boolean;
  local?: boolean;
}

const KM = 'https://incompetech.com/music/royalty-free/mp3-royaltyfree';
const MX = 'https://assets.mixkit.co/music';

export const TRACKS: Track[] = [
  { title: 'Volatile Reaction', artist: 'Kevin MacLeod', url: `${KM}/Volatile%20Reaction.mp3` },
  { title: 'Electrodoodle', artist: 'Kevin MacLeod', url: `${KM}/Electrodoodle.mp3` },
  { title: 'Ouroboros', artist: 'Kevin MacLeod', url: `${KM}/Ouroboros.mp3` },
  { title: 'Feral Chase', artist: 'Kevin MacLeod', url: `${KM}/Feral%20Chase.mp3` },
  { title: 'Space Fighter Loop', artist: 'Kevin MacLeod', url: `${KM}/Space%20Fighter%20Loop.mp3` },
  { title: 'Hitman', artist: 'Kevin MacLeod', url: `${KM}/Hitman.mp3` },
  { title: 'Full On', artist: 'Kevin MacLeod', url: `${KM}/Full%20On.mp3` },
  { title: 'Deliberate Thought', artist: 'Kevin MacLeod', url: `${KM}/Deliberate%20Thought.mp3` },
  { title: 'Karma', artist: 'Michael Ramir C.', url: `${MX}/1183/1183.mp3`, dl: true },
  { title: 'Techno Fest Vibes', artist: 'Alejandro Magaña (A. M.)', url: `${MX}/124/124.mp3`, dl: true },
  { title: 'A Game', artist: 'Michael Ramir C.', url: `${MX}/777/777.mp3`, dl: true },
  { title: 'Take this Higher', artist: 'Michael Ramir C.', url: `${MX}/1012/1012.mp3`, dl: true },
  { title: 'Dance Zero', artist: 'Lily J', url: `${MX}/740/740.mp3`, dl: true },
  { title: 'Sports Highlights', artist: 'Ahjay Stelino', url: `${MX}/51/51.mp3`, dl: true },
  { title: 'K.O.', artist: 'Michael Ramir C.', url: `${MX}/1068/1068.mp3`, dl: true },
  { title: 'Sports Rock', artist: 'Ahjay Stelino', url: `${MX}/78/78.mp3`, dl: true },
  { title: 'Hooligans', artist: 'Michael Ramir C.', url: `${MX}/998/998.mp3`, dl: true },
];

export const OFFLINE_URLS = TRACKS.filter((t) => t.dl).map((t) => t.url);
export const OFFLINE_SIZE_MB = 34;
