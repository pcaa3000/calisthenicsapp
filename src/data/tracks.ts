export interface Track {
  title: string;
  artist: string;
  url: string;
}

const KM = 'https://incompetech.com/music/royalty-free/mp3-royaltyfree';

export const TRACKS: Track[] = [
  { title: 'Volatile Reaction', artist: 'Kevin MacLeod', url: `${KM}/Volatile%20Reaction.mp3` },
  { title: 'Electrodoodle', artist: 'Kevin MacLeod', url: `${KM}/Electrodoodle.mp3` },
  { title: 'Ouroboros', artist: 'Kevin MacLeod', url: `${KM}/Ouroboros.mp3` },
  { title: 'Feral Chase', artist: 'Kevin MacLeod', url: `${KM}/Feral%20Chase.mp3` },
  { title: 'Space Fighter Loop', artist: 'Kevin MacLeod', url: `${KM}/Space%20Fighter%20Loop.mp3` },
  { title: 'Hitman', artist: 'Kevin MacLeod', url: `${KM}/Hitman.mp3` },
  { title: 'Full On', artist: 'Kevin MacLeod', url: `${KM}/Full%20On.mp3` },
  { title: 'Deliberate Thought', artist: 'Kevin MacLeod', url: `${KM}/Deliberate%20Thought.mp3` },
];
