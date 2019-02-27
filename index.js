/*
 * This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* This fairly simple contraption maps an Ingress 'barcode' agent name
 * into a human-memorable name.
 *
 * The basics: barcode names (names consisting of combinations of I and l
 * characters, which are homoglyphic in the relevant sans-serif typefaces)
 * are implicitly base-2 integers; by interpreting 'l' as a true bit and 'i'
 * as a false one, the barcode name is mapped to an integer.  Names of different
 * lengths, from 1..15, are mapped to consecutive ranges of the 16-bit integer
 * range, in total covering 2^16-2 unique values.  Having done so, the result
 * is split into two 8-bit offsets into 256-word dictionaries.
 *
 * To make the generated names memorable and sometimes amusing, the first
 * dictionary consists of english adjectives, the second of english nouns.
 *
 * It is not known (to the author) if good Node style exists, but they caution
 * that this is almost certainly not it.
 */

exports.help = (req, res) => {
	res.status(200).send('https://github.com/greentriangles/barcodes');
};

class InvalidArgumentError extends Error {
	constructor(message) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}

let agentNameRE = /^@?([il]{1,15})$/i;

extractAgentName = (inp) => {
	if (!inp) return null;
	let m = inp.match(agentNameRE);
	if (!m) {
		return null;
	}
	return m[1].toLowerCase();
};

binaryBarcodeToInt = (b) => {
	let r = 0;
	for (let i = 0; i < b.length; i++) {
		r <<= 1;
		if (b[i] === 'l') {
			r |= 1;
		}
	}
	return r;
};

barcodeToInt = (agent) => {
	let lengthOffset = Math.pow(2, agent.length) - 2;
	return lengthOffset + binaryBarcodeToInt(agent)
};

titleCase = (s) => {
	return s[0].toUpperCase() + s.substr(1);
};

intToName = (v) => {
	let h = (v & 0xff00) >> 8, l = (v & 0xff);
	return titleCase(firstWords[h]) + titleCase(secondWords[l]);
};

convertBarcode = (agent) => {
	let a = extractAgentName(agent);
	if (!a) {
		console.log('invalid agent name');
		throw new InvalidArgumentError('Invalid/non-barcode agent name: ' + (agent || '(empty)'));
	}
	let intv = barcodeToInt(a);
	let name = intToName(intv);
	return {
		'barcode_name': a.toLowerCase(),
		'given_name': name,
		'integer_value': intv,
	};
};

barcodeToName = (req, res, agent) => {
	try {
		let r = convertBarcode(agent);
		return res.status(200).send(r);
	} catch (e) {
	 	if (e instanceof InvalidArgumentError) {
			return res.status(400).send({error: e.message});
		}
		console.log(e);
		return res.status(503).send({error: 'internal error'});
	}
};

bcget = (req, res) => {
	return barcodeToName(req, res, req.query.agent);
};

bcpost = (req, res) => {
	return barcodeToName(req, res, req.body.agent);
};

multiBarcodeToName = (req, res, agents) => {
	var response = {};
	try {
		agents.forEach(function (agent) {
			let r = convertBarcode(agent);
			response[agent] = r;
		});
	} catch (e) {
		if (e instanceof InvalidArgumentError) {
			return res.status(400).send({error: e.message});
		}
		return res.status(503).send({error: 'internal error'});
	}
	return res.status(200).send(response);
};

bcgetmulti = (req, res) => {
	return multiBarcodeToName(req, res, req.query.agents.split(','));
};

bcpostmulti = (req, res) => {
	return multiBarcodeToName(req, res, req.body.agents);
};

exports.barcode = (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	switch (req.method) {
		case 'GET': return bcget(req, res);
		case 'POST': return bcpost(req, res);
	}
	res.status(400).send('Unsupported method');
};

exports.barcodemulti = (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	switch (req.method) {
		case 'GET': return bcgetmulti(req, res);
		case 'POST': return bcpostmulti(req, res);
	}
	res.status(400).send('Unsupported method');
};

let firstWords = ['adorable',
	'agreeable',
	'alive',
	'ancient',
	'angry',
	'aroused',
	'beautiful',
	'beefy',
	'better',
	'bewildered',
	'big',
	'biting',
	'bitter',
	'black',
	'bland',
	'blue',
	'blushing',
	'boiling',
	'bored',
	'brave',
	'breeze',
	'brief',
	'bright',
	'broad',
	'broken',
	'bulky',
	'bumpy',
	'burly',
	'calm',
	'careful',
	'charming',
	'cheeky',
	'cheerful',
	'chilly',
	'chubby',
	'clean',
	'clear',
	'clever',
	'cloudy',
	'clueless',
	'clumsy',
	'cold',
	'colorful',
	'colossal',
	'combative',
	'comfortable',
	'cooing',
	'cool',
	'creepy',
	'crooked',
	'cuddly',
	'curly',
	'curved',
	'damaged',
	'damp',
	'dead',
	'deafening',
	'deep',
	'defeated',
	'delicious',
	'delightful',
	'dirty',
	'drab',
	'dry',
	'dusty',
	'eager',
	'early',
	'easy',
	'elegant',
	'embarrassed',
	'erect',
	'faint',
	'faithful',
	'famous',
	'fancy',
	'fast',
	'fat',
	'fierce',
	'filthy',
	'flaky',
	'flat',
	'fluffy',
	'freezing',
	'fresh',
	'gentle',
	'gifted',
	'gigantic',
	'glamorous',
	'gray',
	'greasy',
	'great',
	'green',
	'grumpy',
	'handsome',
	'happy',
	'helpful',
	'helpless',
	'high',
	'hissing',
	'hollow',
	'hot',
	'huge',
	'icy',
	'immense',
	'important',
	'inexpensive',
	'itchy',
	'jealous',
	'jolly',
	'juicy',
	'kind',
	'large',
	'late',
	'lazy',
	'little',
	'lively',
	'long',
	'loose',
	'loud',
	'low',
	'magnificent',
	'mammoth',
	'massive',
	'melodic',
	'melted',
	'miniature',
	'modern',
	'mushy',
	'mysterious',
	'narrow',
	'nervous',
	'nice',
	'noisy',
	'nutritious',
	'obedient',
	'obnoxious',
	'odd',
	'old',
	'orange',
	'panicky',
	'petite',
	'plain',
	'powerful',
	'prickly',
	'proud',
	'puny',
	'purple',
	'purring',
	'quaint',
	'quick',
	'quiet',
	'rainy',
	'rapid',
	'raspy',
	'red',
	'relieved',
	'repulsive',
	'rich',
	'rotten',
	'round',
	'salty',
	'sarcastic',
	'scant',
	'scary',
	'scattered',
	'scrawny',
	'screeching',
	'selfish',
	'shaggy',
	'shaky',
	'shallow',
	'sharp',
	'shiny',
	'short',
	'shy',
	'silky',
	'skinny',
	'slimy',
	'slippery',
	'slow',
	'small',
	'smarmy',
	'smiling',
	'smoggy',
	'smooth',
	'smug',
	'soggy',
	'solid',
	'sore',
	'sour',
	'sparkling',
	'spicy',
	'splendid',
	'spotless',
	'square',
	'stale',
	'steady',
	'steep',
	'sticky',
	'stormy',
	'stout',
	'straight',
	'strange',
	'strong',
	'stunning',
	'substantial',
	'successful',
	'succulent',
	'superficial',
	'superior',
	'swanky',
	'sweet',
	'swift',
	'tall',
	'tart',
	'tasteless',
	'tasty',
	'teeny',
	'tender',
	'tense',
	'terrible',
	'testy',
	'turgid',
	'thick',
	'thoughtful',
	'thundering',
	'tight',
	'timely',
	'tiny',
	'tricky',
	'trite',
	'troubled',
	'twitter pated',
	'ugliest',
	'uneven',
	'unsightly',
	'upset',
	'uptight',
	'vast',
	'vexed',
	'victorious',
	'voiceless',
	'warm',
	'weak',
	'wet',
	'whispering',
	'white',
	'wide',
	'witty',
	'wooden',
	'worried',
	'wrong',
	'yellow',
	'young',
	'yummy',
	'zealous',
];

let secondWords = [
	'actor',
	'adenoid',
	'airplane',
	'airport',
	'akita',
	'albatross',
	'alligator',
	'ant',
	'apple',
	'army',
	'aunt',
	'badger',
	'balinese',
	'ball',
	'banana',
	'bandicoot',
	'barnacle',
	'baseball',
	'basket',
	'bat',
	'bear',
	'beard',
	'beaver',
	'beef',
	'berry',
	'bird',
	'bison',
	'boy',
	'bread',
	'brother',
	'brush',
	'buffalo',
	'bulb',
	'butter',
	'butter ',
	'butterfly',
	'caboose',
	'cactus',
	'caiman',
	'calamity',
	'camel',
	'canoe',
	'caramel',
	'cargo',
	'carpenter',
	'cast',
	'cave',
	'cent',
	'chamois',
	'chaps',
	'cheetah',
	'cherry',
	'chicken',
	'chinook',
	'chipmunk',
	'chocolate',
	'cloud',
	'cobweb',
	'cockroach',
	'coil',
	'collie',
	'coral',
	'cougar',
	'cow',
	'cracker',
	'cream',
	'crocodile',
	'croissant',
	'custard',
	'cuttlefish',
	'dad',
	'dalmatian',
	'death',
	'deer',
	'dhole',
	'dingo',
	'dinner',
	'discus',
	'doctor',
	'dodo',
	'dog',
	'doll',
	'dolphin',
	'donkey',
	'door',
	'dormouse',
	'dotard',
	'doughnut',
	'dragonfly',
	'drever',
	'droplet',
	'duck',
	'dugong',
	'dunker',
	'eagle',
	'earlobe',
	'earwig',
	'eggnog',
	'ejection',
	'elbow',
	'elephant',
	'engineer',
	'eyeball',
	'face',
	'falcon',
	'ferret',
	'figure',
	'fipple',
	'fireman',
	'fish',
	'flamingo',
	'flavor',
	'flock',
	'flounder',
	'fog',
	'fork',
	'frigatebird',
	'garlic',
	'gate',
	'gecko',
	'gerbil',
	'glove',
	'goose',
	'gopher',
	'grain',
	'grammar',
	'grasshopper',
	'grouse',
	'guppy',
	'hair',
	'haircut',
	'hammer',
	'hamster',
	'hand',
	'hare',
	'hedgehog',
	'heron',
	'holiday',
	'horse',
	'hot',
	'human',
	'hydrant',
	'iguana',
	'impact',
	'jaguar',
	'ketchup',
	'kidney',
	'knob',
	'laundry',
	'lecher',
	'lentil',
	'life',
	'liver',
	'lizard',
	'magpie',
	'manatee',
	'martian',
	'mask',
	'mayfly',
	'meat',
	'meerkat',
	'melody',
	'mime',
	'mist',
	'mole',
	'mom',
	'moose',
	'mouse',
	'mule',
	'mustache',
	'napkin',
	'newt',
	'nipples',
	'nose',
	'nostril',
	'nougat',
	'number',
	'oatmeal',
	'ocelot',
	'octopus',
	'ointment',
	'opossum',
	'orifice',
	'ostrich',
	'otter',
	'oyster',
	'paddle',
	'pancake',
	'pants',
	'paper',
	'paradox',
	'parrot',
	'peacock',
	'pelican',
	'pelvis',
	'penguin',
	'pest',
	'pig',
	'pineapple',
	'platypus',
	'popcorn',
	'porcupine',
	'possum',
	'puffin',
	'pug',
	'queen',
	'quiet',
	'quoll',
	'rabbit',
	'raccoon',
	'ragdoll',
	'rat',
	'robot',
	'rubber',
	'salamander',
	'sauce',
	'scarf',
	'scorpion',
	'sheep',
	'shelf',
	'sideburns',
	'sister',
	'snowshoe',
	'sparrow',
	'spork',
	'spelling',
	'sponge',
	'spoon',
	'squid',
	'sugar',
	'suspenders',
	'swan',
	'termite',
	'thighs',
	'throb',
	'toffee',
	'tomato',
	'tortilla',
	'toucan',
	'trampoline',
	'tube',
	'turkey',
	'twig',
	'uncle',
	'uvula',
	'vanilla',
	'vogon',
	'weasel',
	'wheel',
	'whiskey',
	'wombat',
	'wrench',
	'wumpus',
	'yak',
	'zebra',
];

// vi: set ts=2 sw=2 noet
