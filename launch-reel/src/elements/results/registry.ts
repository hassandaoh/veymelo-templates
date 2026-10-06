import type {ComponentType} from 'react';
import type {Aspect, ResultProps} from './kit';
import Sneaker from './r01-sneaker';
import Perfume from './r02-perfume';
import Kinetic from './r03-kinetic';
import Infographic from './r04-infographic';
import Coffee from './r05-coffee';
import Social from './r06-social';
import Collage from './r07-collage';
import Watch from './r08-watch';
import App from './r09-app';
import MapResult from './r10-map';
import Logo from './r11-logo';
import Poster from './r12-poster';
import Lyric from './r13-lyric';
import Food from './r14-food';
import Sport from './r15-sport';
import Explainer from './r16-explainer';
import Podcast from './r17-podcast';
import World from './r18-world';
import Shapes from './r19-shapes';
import Mountains from './r20-mountains';
import IsoCity from './r21-isocity';
import Botanical from './r22-botanical';

export type Result = {
  id: string;
  Comp: ComponentType<ResultProps>;
  aspect: Aspect;
  /** the one-line prompt that made it */
  prompt: string;
  /** frame of its own animation to start from in the montage and the wall (its best moment) */
  peek: number;
  /** sounds caused by its own picture: [frame in its own clock, effect, volume] */
  cues?: [number, string, number][];
};

export const RESULTS: Record<string, Result> = {
  sneaker: {id: 'sneaker', Comp: Sneaker, aspect: '16:9', prompt: 'make a launch ad, bold', peek: 40, cues: [[0, 'thud', 0.5], [8, 'whoosh', 0.3], [50, 'pop', 0.3]]},
  perfume: {id: 'perfume', Comp: Perfume, aspect: '16:9', prompt: 'a 3D perfume ad, slow light, luxury', peek: 90, cues: [[0, 'swell', 0.35], [30, 'shimmer', 0.3]]},
  kinetic: {id: 'kinetic', Comp: Kinetic, aspect: '16:9', prompt: 'kinetic type for our run club, on the beat', peek: 70, cues: [[0, 'hit', 0.55], [30, 'hit', 0.55], [60, 'hit', 0.6], [80, 'thud', 0.35]]},
  infographic: {id: 'infographic', Comp: Infographic, aspect: '16:9', prompt: 'our growth this year as a clean chart', peek: 60, cues: [[6, 'rise', 0.25], [96, 'tick', 0.4]]},
  coffee: {id: 'coffee', Comp: Coffee, aspect: '16:9', prompt: '2.5D coffee ad, layered, warm morning', peek: 60, cues: [[20, 'bloom', 0.3]]},
  social: {id: 'social', Comp: Social, aspect: '9:16', prompt: 'a 9:16 reel with captions on every word', peek: 50, cues: [[0, 'pop', 0.3], [40, 'pop', 0.3], [96, 'pop', 0.3]]},
  collage: {id: 'collage', Comp: Collage, aspect: '1:1', prompt: 'a summer collage for our fashion drop', peek: 40, cues: [[0, 'paper', 0.5], [8, 'paper', 0.45], [22, 'paper', 0.5], [30, 'paper', 0.45], [38, 'pop', 0.35]]},
  watch: {id: 'watch', Comp: Watch, aspect: '1:1', prompt: 'minimal watch ad', peek: 40, cues: [[60, 'tick', 0.3], [120, 'tick', 0.3]]},
  app: {id: 'app', Comp: App, aspect: '9:16', prompt: 'app promo, 9:16', peek: 40, cues: [[0, 'whoosh', 0.25], [100, 'pop', 0.4]]},
  map: {id: 'map', Comp: MapResult, aspect: '16:9', prompt: 'our trip as a route map', peek: 50, cues: [[10, 'pop', 0.35], [70, 'pop', 0.35], [110, 'pop', 0.35]]},
  logo: {id: 'logo', Comp: Logo, aspect: '16:9', prompt: 'reveal our logo', peek: 30, cues: [[0, 'swell', 0.3], [80, 'shimmer', 0.35]]},
  poster: {id: 'poster', Comp: Poster, aspect: '9:16', prompt: 'festival countdown poster', peek: 100, cues: [[0, 'beep', 0.4], [20, 'beep', 0.4], [40, 'beep', 0.4], [60, 'hit', 0.55]]},
  lyric: {id: 'lyric', Comp: Lyric, aspect: '1:1', prompt: 'lyric video for our single', peek: 20, cues: [[0, 'shimmer', 0.25]]},
  food: {id: 'food', Comp: Food, aspect: '16:9', prompt: 'menu promo for our ramen', peek: 10, cues: [[14, 'plop', 0.4], [20, 'plop', 0.4], [26, 'plop', 0.4], [32, 'plop', 0.4], [38, 'plop', 0.35], [44, 'plop', 0.35]]},
  sport: {id: 'sport', Comp: Sport, aspect: '9:16', prompt: 'player stats card', peek: 20, cues: [[0, 'thud', 0.45], [30, 'rise', 0.22]]},
  explainer: {id: 'explainer', Comp: Explainer, aspect: '16:9', prompt: 'explain rooftop solar simply', peek: 112, cues: [[0, 'pop', 0.3], [36, 'pop', 0.3], [72, 'pop', 0.3], [108, 'pop', 0.3]]},
  world: {id: 'world', Comp: World, aspect: '16:9', prompt: 'a cozy 3D world for our game trailer', peek: 60, cues: [[0, 'swell', 0.4], [40, 'shimmer', 0.3]]},
  shapes: {id: 'shapes', Comp: Shapes, aspect: '1:1', prompt: 'soft 3D shapes for our brand intro', peek: 70, cues: [[18, 'bounce', 0.5], [27, 'bounce', 0.45], [36, 'bounce', 0.5], [45, 'bounce', 0.45], [54, 'bounce', 0.5], [64, 'bounce', 0.4]]},
  mountains: {id: 'mountains', Comp: Mountains, aspect: '16:9', prompt: '2.5D travel film, mountains at dawn', peek: 90, cues: [[0, 'swell', 0.4], [70, 'bloom', 0.35]]},
  isocity: {id: 'isocity', Comp: IsoCity, aspect: '16:9', prompt: 'isometric city for our delivery app', peek: 70, cues: [[10, 'plop', 0.3], [16, 'plop', 0.3], [22, 'plop', 0.3], [28, 'plop', 0.3], [34, 'plop', 0.3], [40, 'plop', 0.3], [46, 'plop', 0.3]]},
  botanical: {id: 'botanical', Comp: Botanical, aspect: '1:1', prompt: 'botanical line art that blooms', peek: 70, cues: [[46, 'bloom', 0.35], [54, 'bloom', 0.3], [62, 'bloom', 0.3], [70, 'bloom', 0.3]]},
  podcast: {id: 'podcast', Comp: Podcast, aspect: '1:1', prompt: 'audiogram for episode 42', peek: 20, cues: [[0, 'pop', 0.25]]},
};
export const ORDER = Object.keys(RESULTS);
