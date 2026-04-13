// Image catalog — maps keywords to local image paths
// Images served from /images/ in the public directory

const imageCatalog = {
  // Shapes (SVG — always available)
  circle: '/images/shapes/circle.svg',
  square: '/images/shapes/square.svg',
  triangle: '/images/shapes/triangle.svg',
  rectangle: '/images/shapes/rectangle.svg',
  pentagon: '/images/shapes/pentagon.svg',
  hexagon: '/images/shapes/hexagon.svg',
  star: '/images/shapes/star.svg',
  cube: '/images/shapes/cube.svg',
  sphere: '/images/shapes/sphere.svg',
  cylinder: '/images/shapes/cylinder.svg',
  cone: '/images/shapes/cone.svg',

  // Animals (to be populated with Openclipart/stock images)
  cat: '/images/vocab/animals/cat.png',
  dog: '/images/vocab/animals/dog.png',
  fish: '/images/vocab/animals/fish.png',
  bird: '/images/vocab/animals/bird.png',
  turtle: '/images/vocab/animals/turtle.png',
  dolphin: '/images/vocab/animals/dolphin.png',
  whale: '/images/vocab/animals/whale.png',
  snake: '/images/vocab/animals/snake.png',
  frog: '/images/vocab/animals/frog.png',
  butterfly: '/images/vocab/animals/butterfly.png',
  lion: '/images/vocab/animals/lion.png',
  elephant: '/images/vocab/animals/elephant.png',
  monkey: '/images/vocab/animals/monkey.png',
  rabbit: '/images/vocab/animals/rabbit.png',
  horse: '/images/vocab/animals/horse.png',

  // Sea life
  coral: '/images/vocab/sealife/coral.png',
  reef: '/images/vocab/sealife/reef.png',
  clownfish: '/images/vocab/sealife/clownfish.png',
  starfish: '/images/vocab/sealife/starfish.png',
  jellyfish: '/images/vocab/sealife/jellyfish.png',
  octopus: '/images/vocab/sealife/octopus.png',
  crab: '/images/vocab/sealife/crab.png',
  seaweed: '/images/vocab/sealife/seaweed.png',
  shark: '/images/vocab/sealife/shark.png',
  seahorse: '/images/vocab/sealife/seahorse.png',

  // Objects
  ship: '/images/vocab/objects/ship.png',
  boat: '/images/vocab/objects/boat.png',
  car: '/images/vocab/objects/car.png',
  house: '/images/vocab/objects/house.png',
  ball: '/images/vocab/objects/ball.png',
  clock: '/images/vocab/objects/clock.png',
  book: '/images/vocab/objects/book.png',
  chair: '/images/vocab/objects/chair.png',
  table: '/images/vocab/objects/table.png',
  cup: '/images/vocab/objects/cup.png',
  key: '/images/vocab/objects/key.png',
  umbrella: '/images/vocab/objects/umbrella.png',
  phone: '/images/vocab/objects/phone.png',
  bag: '/images/vocab/objects/bag.png',
  hat: '/images/vocab/objects/hat.png',

  // Food
  apple: '/images/vocab/food/apple.png',
  banana: '/images/vocab/food/banana.png',
  bread: '/images/vocab/food/bread.png',
  egg: '/images/vocab/food/egg.png',
  milk: '/images/vocab/food/milk.png',
  cake: '/images/vocab/food/cake.png',
  pizza: '/images/vocab/food/pizza.png',
  rice: '/images/vocab/food/rice.png',
  water: '/images/vocab/food/water.png',
  orange: '/images/vocab/food/orange.png',
  cheese: '/images/vocab/food/cheese.png',
  chicken: '/images/vocab/food/chicken.png',

  // Nature
  tree: '/images/vocab/nature/tree.png',
  flower: '/images/vocab/nature/flower.png',
  sun: '/images/vocab/nature/sun.png',
  moon: '/images/vocab/nature/moon.png',
  cloud: '/images/vocab/nature/cloud.png',
  rain: '/images/vocab/nature/rain.png',
  mountain: '/images/vocab/nature/mountain.png',
  river: '/images/vocab/nature/river.png',
  beach: '/images/vocab/nature/beach.png',
  desert: '/images/vocab/nature/desert.png',
  forest: '/images/vocab/nature/forest.png',
  sea: '/images/vocab/nature/sea.png',

  // Body
  hand: '/images/vocab/body/hand.png',
  eye: '/images/vocab/body/eye.png',
  ear: '/images/vocab/body/ear.png',
  nose: '/images/vocab/body/nose.png',
  mouth: '/images/vocab/body/mouth.png',
  foot: '/images/vocab/body/foot.png',
  head: '/images/vocab/body/head.png',
  teeth: '/images/vocab/body/teeth.png',

  // Places
  school: '/images/vocab/places/school.png',
  hospital: '/images/vocab/places/hospital.png',
  shop: '/images/vocab/places/shop.png',
  hotel: '/images/vocab/places/hotel.png',
  airport: '/images/vocab/places/airport.png',
  farm: '/images/vocab/places/farm.png',
  park: '/images/vocab/places/park.png',
  mosque: '/images/vocab/places/mosque.png',
  church: '/images/vocab/places/church.png',

  // Actions
  run: '/images/vocab/actions/run.png',
  jump: '/images/vocab/actions/jump.png',
  swim: '/images/vocab/actions/swim.png',
  read: '/images/vocab/actions/read.png',
  write: '/images/vocab/actions/write.png',
  eat: '/images/vocab/actions/eat.png',
  sleep: '/images/vocab/actions/sleep.png',
  play: '/images/vocab/actions/play.png',

  // Science
  plant: '/images/vocab/science/plant.png',
  seed: '/images/vocab/science/seed.png',
  root: '/images/vocab/science/root.png',
  leaf: '/images/vocab/science/leaf.png',
  magnet: '/images/vocab/science/magnet.png',
  thermometer: '/images/vocab/science/thermometer.png',
  microscope: '/images/vocab/science/microscope.png',
  skeleton: '/images/vocab/science/skeleton.png',
};

// Get image path for a keyword (case-insensitive)
export function getImagePath(keyword) {
  return imageCatalog[keyword.toLowerCase()] || null;
}

// Get all available keywords
export function getAvailableImages() {
  return Object.keys(imageCatalog);
}

// Check if an image exists in the catalog
export function hasImage(keyword) {
  return keyword.toLowerCase() in imageCatalog;
}

export default imageCatalog;
