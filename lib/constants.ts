export const APP_NAME = "Cardlar";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ─── Occasion Types (needed early for style/example records) ──────────
export type OccasionKey =
  | "birthday"
  | "wedding"
  | "baby-shower"
  | "get-well"
  | "congratulations"
  | "thank-you"
  | "christmas"
  | "valentines"
  | "condolences"
  | "anniversary"
  | "mothers-day"
  | "fathers-day"
  | "graduation"
  | "new-home"
  | "new-job"
  | "retirement"
  | "engagement"
  | "new-baby"
  | "easter"
  | "new-year"
  | "halloween"
  | "thanksgiving"
  | "thinking-of-you"
  | "good-luck"
  | "miss-you"
  | "sorry"
  | "custom";

// ─── Image Style Presets (per occasion) ───────────────────────────────
export interface StylePreset {
  id: string;
  name: string;
  icon: string;
  editPrompt: string; // used with fal-ai/nano-banana-2/edit when user uploads a photo
  generatePrompt: string; // used with fal-ai/nano-banana-2 when generating from scratch
}

export const OCCASION_STYLES: Record<OccasionKey, StylePreset[]> = {
  birthday: [
    {
      id: "polaroid",
      name: "Polaroid",
      icon: "📸",
      editPrompt: "Transform this photo into a polaroid-style image with a white border frame, slight natural tilt, warm vintage color tones, and a fun birthday party atmosphere",
      generatePrompt: "A fun birthday polaroid photo with warm vintage tones, white border frame, confetti and party decorations, joyful celebration",
    },
    {
      id: "party-illustration",
      name: "Party Illustration",
      icon: "🎨",
      editPrompt: "Transform this photo into a colorful hand-drawn party illustration style with bold outlines, festive birthday decorations, balloons and confetti around the subject",
      generatePrompt: "A colorful hand-drawn birthday party illustration with bold outlines, festive balloons, confetti, streamers, and a birthday cake, cheerful and fun",
    },
    {
      id: "pop-art",
      name: "Pop Art",
      icon: "💥",
      editPrompt: "Transform this photo into a vibrant pop art style with bold colors, halftone dots, comic book aesthetics, and birthday celebration elements",
      generatePrompt: "A vibrant pop art birthday celebration with bold colors, halftone dots, comic book style, birthday cake and presents, retro and energetic",
    },
    {
      id: "cartoon",
      name: "Cartoon",
      icon: "✨",
      editPrompt: "Transform this photo into a cute cartoon illustration style, like a Pixar character, with bright cheerful colors and birthday party elements",
      generatePrompt: "A cute cartoon birthday scene in Pixar style with bright cheerful colors, adorable characters celebrating with cake, balloons, and presents",
    },
  ],
  wedding: [
    {
      id: "watercolor",
      name: "Elegant Watercolor",
      icon: "🎨",
      editPrompt: "Transform this photo into an elegant watercolor painting with soft flowing brushstrokes, delicate floral accents, romantic pastel tones, and a dreamy wedding atmosphere",
      generatePrompt: "An elegant watercolor painting of a romantic wedding scene with soft flowing brushstrokes, white roses, golden rings, delicate floral accents, and dreamy pastel tones",
    },
    {
      id: "vintage",
      name: "Soft Vintage",
      icon: "📜",
      editPrompt: "Transform this photo into a soft vintage style with sepia-tinted tones, gentle vignette, classic film grain, and a timeless romantic wedding feel",
      generatePrompt: "A soft vintage wedding scene with sepia tones, classic film grain, elegant couple, white flowers, and timeless romantic atmosphere",
    },
    {
      id: "portrait",
      name: "Classic Portrait",
      icon: "🖼️",
      editPrompt: "Transform this photo into a classic oil painting portrait style with rich warm colors, soft lighting, elegant composition, and romantic wedding ambiance",
      generatePrompt: "A classic oil painting style wedding portrait with rich warm colors, soft golden lighting, elegant roses, and romantic ambiance",
    },
    {
      id: "gold-frame",
      name: "Gold Frame",
      icon: "✨",
      editPrompt: "Transform this photo by adding an ornate golden frame border, soft warm lighting, and elegant wedding decorations with a luxurious feel",
      generatePrompt: "An elegant wedding scene framed in an ornate golden border with soft warm lighting, white roses, champagne, and luxurious celebration atmosphere",
    },
  ],
  "baby-shower": [
    {
      id: "pastel-illustration",
      name: "Pastel Illustration",
      icon: "🎨",
      editPrompt: "Transform this photo into a soft pastel illustration with gentle colors, cute baby-themed elements like stars and clouds, and a warm nurturing feel",
      generatePrompt: "A soft pastel illustration of a baby nursery scene with gentle colors, cute stuffed animals, stars and clouds, warm and nurturing atmosphere",
    },
    {
      id: "storybook",
      name: "Storybook",
      icon: "📖",
      editPrompt: "Transform this photo into a children's storybook illustration style with whimsical details, soft colors, and charming baby-themed decorations",
      generatePrompt: "A charming children's storybook illustration with a cute baby theme, whimsical details, soft pastel colors, adorable animals, and magical atmosphere",
    },
    {
      id: "cute-cartoon",
      name: "Cute Cartoon",
      icon: "🧸",
      editPrompt: "Transform this photo into an adorable cartoon style with rounded soft shapes, pastel baby colors, cute characters, and sweet baby shower decorations",
      generatePrompt: "An adorable cartoon baby shower scene with rounded soft shapes, pastel colors, cute baby items, teddy bears, and sweet gentle atmosphere",
    },
    {
      id: "soft-watercolor",
      name: "Soft Watercolor",
      icon: "💧",
      editPrompt: "Transform this photo into a delicate watercolor style with soft washes of pastel pink and blue, gentle brushstrokes, and dreamy baby shower atmosphere",
      generatePrompt: "A delicate watercolor baby shower scene with soft washes of pastel pink and blue, gentle brushstrokes, baby booties, flowers, and dreamy atmosphere",
    },
  ],
  "get-well": [
    {
      id: "gentle-watercolor",
      name: "Gentle Watercolor",
      icon: "🎨",
      editPrompt: "Transform this photo into a gentle watercolor painting with warm soothing colors, soft sunflowers and daisies, and a hopeful healing atmosphere",
      generatePrompt: "A gentle watercolor painting of bright sunflowers and daisies in warm sunshine, soft soothing colors, hopeful and uplifting healing atmosphere",
    },
    {
      id: "sunny-illustration",
      name: "Sunny Illustration",
      icon: "☀️",
      editPrompt: "Transform this photo into a bright cheerful illustration with warm golden sunshine, happy flowers, butterflies, and an uplifting feel-better atmosphere",
      generatePrompt: "A bright cheerful illustration with warm golden sunshine streaming through a window, happy flowers, butterflies, and a cozy uplifting get-well atmosphere",
    },
    {
      id: "warm-pastel",
      name: "Warm Pastel",
      icon: "🌸",
      editPrompt: "Transform this photo into a warm pastel style with soft muted colors, gentle floral elements, and a calming comforting feel",
      generatePrompt: "A warm pastel scene with soft muted colors, a cozy window with flowers, warm tea, gentle sunlight, calming and comforting get-well atmosphere",
    },
  ],
  congratulations: [
    {
      id: "golden-celebration",
      name: "Golden Celebration",
      icon: "🏆",
      editPrompt: "Transform this photo into a grand golden celebration style with sparkles, confetti, golden light effects, and a triumphant achievement atmosphere",
      generatePrompt: "A grand golden celebration with sparkles, confetti, golden trophy, champagne toast, and triumphant achievement atmosphere",
    },
    {
      id: "fireworks",
      name: "Fireworks",
      icon: "🎆",
      editPrompt: "Transform this photo with a dramatic fireworks display background, golden sparkles, and a spectacular night celebration feel",
      generatePrompt: "Spectacular fireworks exploding in a night sky with golden sparkles, confetti streamers, and grand celebration atmosphere",
    },
    {
      id: "elegant-toast",
      name: "Elegant Toast",
      icon: "🥂",
      editPrompt: "Transform this photo into an elegant champagne toast scene with golden bubbles, luxurious setting, and sophisticated celebration style",
      generatePrompt: "An elegant champagne toast with golden bubbles, luxurious celebration setting, roses, and sophisticated congratulations atmosphere",
    },
  ],
  "thank-you": [
    {
      id: "floral-watercolor",
      name: "Floral Watercolor",
      icon: "🌺",
      editPrompt: "Transform this photo into a beautiful floral watercolor style with delicate flowers, warm grateful colors, and an elegant thank-you atmosphere",
      generatePrompt: "A beautiful floral watercolor arrangement with delicate flowers surrounding an elegant thank-you note, warm grateful colors and golden light",
    },
    {
      id: "heartfelt",
      name: "Heartfelt Warm",
      icon: "💛",
      editPrompt: "Transform this photo into a warm heartfelt style with golden light, soft bokeh, gentle flower accents, and a sincere grateful atmosphere",
      generatePrompt: "A heartfelt scene with warm golden light, gift box surrounded by flowers, soft bokeh background, sincere and grateful thank-you atmosphere",
    },
    {
      id: "calligraphy",
      name: "Elegant Calligraphy",
      icon: "✒️",
      editPrompt: "Transform this photo with elegant calligraphy-style decorative borders, refined typography elements, floral accents, and a sophisticated thank-you feel",
      generatePrompt: "An elegant calligraphy-style thank-you design with refined decorative borders, beautiful floral arrangements, and sophisticated grateful atmosphere",
    },
  ],
  christmas: [
    {
      id: "snow-globe",
      name: "Snow Globe",
      icon: "🔮",
      editPrompt: "Transform this photo into a magical snow globe scene with falling snowflakes, warm glowing lights, and enchanting Christmas atmosphere",
      generatePrompt: "A magical Christmas snow globe scene with a cozy village inside, falling snowflakes, warm glowing lights, and enchanting holiday atmosphere",
    },
    {
      id: "vintage-christmas",
      name: "Vintage Christmas",
      icon: "🎅",
      editPrompt: "Transform this photo into a classic vintage Christmas style with warm retro colors, traditional holiday decorations, and nostalgic cozy atmosphere",
      generatePrompt: "A classic vintage Christmas scene with warm retro colors, traditional holiday decorations, a glowing tree, presents, and nostalgic cozy atmosphere",
    },
    {
      id: "festive-illustration",
      name: "Festive Illustration",
      icon: "🎄",
      editPrompt: "Transform this photo into a cheerful festive Christmas illustration with bold holiday colors, decorated tree, presents, and joyful winter wonderland elements",
      generatePrompt: "A cheerful festive Christmas illustration with bold red and green colors, beautifully decorated tree, presents, and joyful winter wonderland atmosphere",
    },
  ],
  valentines: [
    {
      id: "romantic-watercolor",
      name: "Romantic Watercolor",
      icon: "🎨",
      editPrompt: "Transform this photo into a romantic watercolor painting with soft pink and red washes, hearts, roses, and a dreamy love atmosphere",
      generatePrompt: "A romantic watercolor painting with soft pink and red washes, red roses, floating hearts, and a dreamy Valentine's love atmosphere",
    },
    {
      id: "heart-frame",
      name: "Heart Frame",
      icon: "💕",
      editPrompt: "Transform this photo by framing it in a beautiful heart-shaped border with roses, soft bokeh lights, and romantic Valentine's atmosphere",
      generatePrompt: "A beautiful Valentine's scene framed in a heart-shaped border with red roses, soft pink bokeh lights, chocolates, and romantic love atmosphere",
    },
    {
      id: "dreamy-soft",
      name: "Dreamy Soft Focus",
      icon: "💫",
      editPrompt: "Transform this photo into a dreamy soft-focus style with gentle lens flare, warm pink tones, hearts, and ethereal romantic atmosphere",
      generatePrompt: "A dreamy Valentine's scene with soft focus, gentle lens flare, warm pink and red tones, floating hearts, candles, and ethereal romantic atmosphere",
    },
  ],
  condolences: [
    {
      id: "gentle-watercolor",
      name: "Gentle Watercolor",
      icon: "🎨",
      editPrompt: "Transform this photo into a gentle serene watercolor with muted peaceful colors, soft white lilies, and respectful comforting atmosphere",
      generatePrompt: "A gentle serene watercolor of white lilies with soft candlelight, muted peaceful colors, and respectful comforting memorial atmosphere",
    },
    {
      id: "soft-sepia",
      name: "Soft Sepia",
      icon: "🕊️",
      editPrompt: "Transform this photo into a soft sepia-toned style with gentle warmth, peaceful lighting, and a serene respectful memorial atmosphere",
      generatePrompt: "A peaceful sunset over calm water in soft sepia tones, gentle golden light, white dove, serene and respectful memorial atmosphere",
    },
    {
      id: "peaceful-illustration",
      name: "Peaceful Illustration",
      icon: "🌿",
      editPrompt: "Transform this photo into a peaceful illustration style with soft muted colors, gentle nature elements, and a calming serene atmosphere",
      generatePrompt: "A peaceful illustration of white flowers in gentle light, soft muted colors, nature elements like leaves and doves, calming serene memorial atmosphere",
    },
  ],
  anniversary: [
    {
      id: "golden-vintage",
      name: "Golden Vintage",
      icon: "✨",
      editPrompt: "Transform this photo into a golden vintage style with rich warm tones, elegant golden accents, classic film quality, and timeless romantic atmosphere",
      generatePrompt: "A golden vintage anniversary scene with rich warm tones, elegant roses, champagne, golden accents, classic film quality, and timeless romantic atmosphere",
    },
    {
      id: "classic-portrait",
      name: "Classic Portrait",
      icon: "🖼️",
      editPrompt: "Transform this photo into a classic renaissance-style portrait with rich colors, dramatic soft lighting, and elegant romantic anniversary atmosphere",
      generatePrompt: "A classic renaissance-style portrait of intertwined roses with rich colors, dramatic soft lighting, golden decorations, and elegant anniversary atmosphere",
    },
    {
      id: "elegant-watercolor",
      name: "Elegant Watercolor",
      icon: "🌹",
      editPrompt: "Transform this photo into an elegant watercolor with rich romantic reds and golds, flowing rose petal details, and a beautiful anniversary celebration feel",
      generatePrompt: "An elegant watercolor anniversary scene with rich romantic reds and golds, flowing rose petals, champagne glasses, and beautiful celebration atmosphere",
    },
  ],
  "mothers-day": [
    {
      id: "floral-watercolor",
      name: "Floral Watercolor",
      icon: "🎨",
      editPrompt: "Transform this photo into a soft floral watercolor painting with delicate pink and white flowers, gentle brushstrokes, and a warm loving Mother's Day atmosphere",
      generatePrompt: "A soft floral watercolor painting of pink and white roses with gentle brushstrokes, warm golden light, loving and elegant Mother's Day atmosphere",
    },
    {
      id: "garden-portrait",
      name: "Garden Portrait",
      icon: "🌷",
      editPrompt: "Transform this photo into a beautiful garden portrait with blooming flowers, soft natural light, and a warm nurturing maternal atmosphere",
      generatePrompt: "A beautiful garden scene with blooming tulips and roses in soft natural light, butterflies, warm nurturing and loving Mother's Day atmosphere",
    },
    {
      id: "elegant-gold",
      name: "Elegant Gold",
      icon: "✨",
      editPrompt: "Transform this photo with elegant golden accents, refined floral borders, soft warm lighting, and a sophisticated Mother's Day feel",
      generatePrompt: "An elegant Mother's Day design with golden floral borders, refined roses, soft warm lighting, sophisticated and loving atmosphere",
    },
  ],
  "fathers-day": [
    {
      id: "classic-vintage",
      name: "Classic Vintage",
      icon: "📜",
      editPrompt: "Transform this photo into a classic vintage style with warm sepia tones, refined masculine feel, and a distinguished Father's Day atmosphere",
      generatePrompt: "A classic vintage Father's Day scene with warm sepia tones, leather-bound books, a fine pocket watch, distinguished and refined atmosphere",
    },
    {
      id: "outdoor-adventure",
      name: "Outdoor Adventure",
      icon: "🏔️",
      editPrompt: "Transform this photo into an outdoor adventure style with warm natural colors, mountain or nature backdrop, and a rugged wholesome Father's Day feel",
      generatePrompt: "A scenic outdoor landscape with mountains and a warm sunset, fishing rod by a lake, rustic and adventurous Father's Day atmosphere",
    },
    {
      id: "warm-portrait",
      name: "Warm Portrait",
      icon: "🖼️",
      editPrompt: "Transform this photo into a warm portrait style with rich golden lighting, classic composition, and a heartfelt Father's Day atmosphere",
      generatePrompt: "A warm portrait-style Father's Day scene with golden lighting, a cozy study with books and a comfortable chair, heartfelt and distinguished",
    },
  ],
  graduation: [
    {
      id: "golden-achievement",
      name: "Golden Achievement",
      icon: "🏆",
      editPrompt: "Transform this photo into a golden achievement style with confetti, academic decorations, golden light, and a proud graduation celebration atmosphere",
      generatePrompt: "A proud graduation celebration with golden confetti, a mortarboard cap and diploma, streamers, golden light, and triumphant achievement atmosphere",
    },
    {
      id: "classic-academic",
      name: "Classic Academic",
      icon: "📜",
      editPrompt: "Transform this photo into a classic academic portrait style with rich warm tones, elegant academic elements, and a dignified graduation atmosphere",
      generatePrompt: "A classic academic graduation scene with rich warm tones, elegant diploma scroll, mortarboard, and dignified celebration atmosphere",
    },
    {
      id: "festive-celebration",
      name: "Festive Celebration",
      icon: "🎉",
      editPrompt: "Transform this photo into a festive graduation celebration with colorful confetti, balloons, and an energetic party atmosphere",
      generatePrompt: "A festive graduation celebration with colorful confetti, balloons, cap toss in the air, bright sunny day, energetic and joyful atmosphere",
    },
  ],
  "new-home": [
    {
      id: "cozy-watercolor",
      name: "Cozy Watercolor",
      icon: "🎨",
      editPrompt: "Transform this photo into a cozy watercolor illustration of a charming home with warm lights, a garden path, and welcoming housewarming atmosphere",
      generatePrompt: "A cozy watercolor illustration of a charming cottage with warm glowing windows, garden path, flowers, and welcoming housewarming atmosphere",
    },
    {
      id: "key-moment",
      name: "Key Moment",
      icon: "🔑",
      editPrompt: "Transform this photo with a golden house key motif, warm lighting, home decorations, and a celebratory new home atmosphere",
      generatePrompt: "A golden house key with a ribbon bow, front door of a beautiful home, flowers and warm sunlight, celebratory new home atmosphere",
    },
    {
      id: "warm-interior",
      name: "Warm Interior",
      icon: "🏡",
      editPrompt: "Transform this photo into a warm cozy interior scene with soft lighting, comfortable furnishings, and a welcoming homey atmosphere",
      generatePrompt: "A warm cozy living room interior with soft lighting, comfortable furnishings, fireplace, fresh flowers, and inviting new home atmosphere",
    },
  ],
  "new-job": [
    {
      id: "professional-gold",
      name: "Professional Gold",
      icon: "✨",
      editPrompt: "Transform this photo with professional golden accents, confident lighting, and a polished celebratory new career atmosphere",
      generatePrompt: "A professional celebration scene with golden accents, a sleek desk with fresh flowers, city skyline view, confident new job atmosphere",
    },
    {
      id: "fresh-start",
      name: "Fresh Start",
      icon: "🌅",
      editPrompt: "Transform this photo into a fresh start sunrise scene with optimistic warm colors, new beginnings feel, and an exciting career ahead atmosphere",
      generatePrompt: "A beautiful sunrise over a modern cityscape with warm optimistic colors, fresh coffee and notebook, exciting new beginnings career atmosphere",
    },
    {
      id: "celebration-confetti",
      name: "Celebration Confetti",
      icon: "🎉",
      editPrompt: "Transform this photo with colorful confetti, celebratory elements, and an upbeat congratulatory new job atmosphere",
      generatePrompt: "A joyful celebration with colorful confetti, champagne toast, party elements, bright energetic congratulatory new job atmosphere",
    },
  ],
  retirement: [
    {
      id: "golden-sunset",
      name: "Golden Sunset",
      icon: "🌅",
      editPrompt: "Transform this photo into a warm golden sunset scene with peaceful relaxing vibes, soft warm colors, and a serene retirement celebration atmosphere",
      generatePrompt: "A beautiful golden sunset over a calm ocean with warm peaceful colors, a sailboat on gentle waves, serene and celebratory retirement atmosphere",
    },
    {
      id: "elegant-celebration",
      name: "Elegant Celebration",
      icon: "🥂",
      editPrompt: "Transform this photo into an elegant celebration style with golden accents, champagne, refined details, and a distinguished retirement atmosphere",
      generatePrompt: "An elegant retirement celebration with champagne glasses, golden accents, refined floral arrangements, and distinguished celebratory atmosphere",
    },
    {
      id: "leisure-paradise",
      name: "Leisure Paradise",
      icon: "🏖️",
      editPrompt: "Transform this photo into a tropical paradise scene with turquoise water, palm trees, relaxing vibes, and a well-deserved retirement atmosphere",
      generatePrompt: "A tropical paradise beach scene with turquoise water, palm trees, hammock, golden sunshine, well-deserved retirement relaxation atmosphere",
    },
  ],
  engagement: [
    {
      id: "romantic-sparkle",
      name: "Romantic Sparkle",
      icon: "💎",
      editPrompt: "Transform this photo with sparkling diamond accents, romantic soft lighting, rose petals, and an enchanting engagement celebration atmosphere",
      generatePrompt: "A sparkling diamond ring on rose petals with soft bokeh lights, romantic champagne celebration, enchanting engagement atmosphere",
    },
    {
      id: "elegant-watercolor",
      name: "Elegant Watercolor",
      icon: "🎨",
      editPrompt: "Transform this photo into an elegant watercolor with romantic pinks and golds, flowing floral details, and a dreamy engagement celebration feel",
      generatePrompt: "An elegant watercolor engagement scene with romantic pink and gold tones, flowing floral arrangements, champagne, and dreamy celebration atmosphere",
    },
    {
      id: "golden-toast",
      name: "Golden Toast",
      icon: "🥂",
      editPrompt: "Transform this photo with golden champagne celebration elements, elegant bokeh, and a luxurious engagement announcement atmosphere",
      generatePrompt: "A luxurious engagement celebration with champagne toast, golden sparkles, elegant roses, and sophisticated announcement atmosphere",
    },
  ],
  "new-baby": [
    {
      id: "soft-pastel",
      name: "Soft Pastel",
      icon: "🎨",
      editPrompt: "Transform this photo into a soft pastel style with gentle baby colors, cute elements like tiny stars and clouds, and a sweet newborn welcome atmosphere",
      generatePrompt: "A soft pastel welcome baby scene with gentle pink and blue tones, tiny stars, clouds, baby booties, and sweet newborn celebration atmosphere",
    },
    {
      id: "storybook",
      name: "Storybook",
      icon: "📖",
      editPrompt: "Transform this photo into a whimsical children's storybook illustration with gentle colors, cute animals, and a magical new baby atmosphere",
      generatePrompt: "A whimsical storybook illustration welcoming a new baby with cute woodland animals, soft pastel sky, gentle clouds, and magical warm atmosphere",
    },
    {
      id: "tender-portrait",
      name: "Tender Portrait",
      icon: "👶",
      editPrompt: "Transform this photo into a tender portrait style with soft warm lighting, delicate baby elements, and a loving newborn welcome atmosphere",
      generatePrompt: "A tender portrait scene with soft warm lighting, baby crib with mobile, soft toys, delicate flowers, and loving newborn welcome atmosphere",
    },
  ],
  easter: [
    {
      id: "spring-watercolor",
      name: "Spring Watercolor",
      icon: "🎨",
      editPrompt: "Transform this photo into a fresh spring watercolor with pastel flowers, Easter eggs, butterflies, and a bright cheerful Easter atmosphere",
      generatePrompt: "A fresh spring watercolor painting with pastel flowers, decorated Easter eggs in a basket, butterflies, and bright cheerful Easter atmosphere",
    },
    {
      id: "bunny-illustration",
      name: "Bunny Illustration",
      icon: "🐰",
      editPrompt: "Transform this photo into a cute Easter bunny illustration style with spring flowers, decorated eggs, and a whimsical Easter garden atmosphere",
      generatePrompt: "A cute Easter bunny illustration in a spring garden with colorful decorated eggs, blooming flowers, and whimsical cheerful Easter atmosphere",
    },
    {
      id: "pastel-garden",
      name: "Pastel Garden",
      icon: "🌸",
      editPrompt: "Transform this photo into a pastel Easter garden scene with blooming spring flowers, soft sunshine, and a peaceful joyful Easter atmosphere",
      generatePrompt: "A pastel Easter garden with blooming cherry blossoms, spring flowers, decorated eggs hidden in grass, soft sunshine and joyful atmosphere",
    },
  ],
  "new-year": [
    {
      id: "midnight-gold",
      name: "Midnight Gold",
      icon: "🌟",
      editPrompt: "Transform this photo into a midnight gold celebration style with sparklers, golden confetti, champagne, and a glamorous New Year's Eve atmosphere",
      generatePrompt: "A glamorous New Year's Eve celebration with midnight sky, golden fireworks, sparklers, champagne glasses, and festive golden confetti",
    },
    {
      id: "fireworks-spectacular",
      name: "Fireworks Spectacular",
      icon: "🎆",
      editPrompt: "Transform this photo with spectacular fireworks in a midnight sky, colorful bursts, city lights, and a thrilling New Year's celebration atmosphere",
      generatePrompt: "Spectacular fireworks over a city skyline at midnight, colorful bursts in a dark sky, city lights reflecting on water, thrilling New Year celebration",
    },
    {
      id: "elegant-countdown",
      name: "Elegant Countdown",
      icon: "🕛",
      editPrompt: "Transform this photo into an elegant New Year countdown style with a vintage clock, golden decorations, champagne, and a refined celebration atmosphere",
      generatePrompt: "An elegant New Year countdown with a vintage clock striking midnight, golden decorations, champagne bubbles, and refined celebration atmosphere",
    },
  ],
  halloween: [
    {
      id: "spooky-fun",
      name: "Spooky Fun",
      icon: "👻",
      editPrompt: "Transform this photo into a fun spooky Halloween style with jack-o-lanterns, friendly ghosts, bats, and a festive not-too-scary Halloween atmosphere",
      generatePrompt: "A fun spooky Halloween scene with glowing jack-o-lanterns, friendly ghosts, bats flying in a moonlit sky, festive and playfully spooky atmosphere",
    },
    {
      id: "autumn-harvest",
      name: "Autumn Harvest",
      icon: "🍂",
      editPrompt: "Transform this photo into a warm autumn harvest Halloween style with pumpkins, fall leaves, warm golden light, and a cozy seasonal atmosphere",
      generatePrompt: "A warm autumn harvest scene with pumpkins, colorful fall leaves, rustic farmhouse, golden sunset light, cozy Halloween harvest atmosphere",
    },
    {
      id: "moonlit-mystery",
      name: "Moonlit Mystery",
      icon: "🌙",
      editPrompt: "Transform this photo into a moonlit Halloween mystery style with a full moon, silhouetted trees, atmospheric fog, and an enchanting spooky atmosphere",
      generatePrompt: "A moonlit Halloween scene with a full moon, silhouetted bare trees, atmospheric fog, haunted mansion, enchanting and mysteriously spooky atmosphere",
    },
  ],
  thanksgiving: [
    {
      id: "harvest-warmth",
      name: "Harvest Warmth",
      icon: "🍂",
      editPrompt: "Transform this photo into a warm harvest Thanksgiving style with autumn colors, golden light, cornucopia elements, and a grateful cozy atmosphere",
      generatePrompt: "A warm Thanksgiving harvest scene with autumn colors, golden cornucopia with fruits and vegetables, fall leaves, grateful and cozy atmosphere",
    },
    {
      id: "family-feast",
      name: "Family Feast",
      icon: "🦃",
      editPrompt: "Transform this photo into a warm family feast style with a beautifully set table, autumn decorations, candles, and a thankful Thanksgiving atmosphere",
      generatePrompt: "A beautiful Thanksgiving feast table with autumn decorations, warm candles, pumpkins, fall flowers, and a thankful family gathering atmosphere",
    },
    {
      id: "golden-autumn",
      name: "Golden Autumn",
      icon: "🍁",
      editPrompt: "Transform this photo into a golden autumn landscape with warm amber and gold tones, falling leaves, peaceful scenery, and a thankful atmosphere",
      generatePrompt: "A golden autumn landscape with warm amber and gold foliage, a winding path through colorful trees, peaceful and thankful Thanksgiving atmosphere",
    },
  ],
  "thinking-of-you": [
    {
      id: "gentle-watercolor",
      name: "Gentle Watercolor",
      icon: "🎨",
      editPrompt: "Transform this photo into a gentle watercolor with soft calming colors, delicate flowers, and a warm thoughtful caring atmosphere",
      generatePrompt: "A gentle watercolor of soft wildflowers with calming pastel colors, warm sunlight, delicate butterflies, and a warm thoughtful caring atmosphere",
    },
    {
      id: "cozy-warmth",
      name: "Cozy Warmth",
      icon: "☕",
      editPrompt: "Transform this photo into a cozy warm scene with soft golden light, comfortable elements, and a caring thinking-of-you atmosphere",
      generatePrompt: "A cozy warm scene with a cup of tea by a window, soft golden light, a knitted blanket, fresh flowers, and caring thinking-of-you atmosphere",
    },
    {
      id: "starlit-sky",
      name: "Starlit Sky",
      icon: "🌟",
      editPrompt: "Transform this photo into a beautiful starlit sky scene with soft moonlight, gentle clouds, and a reflective thinking-of-you atmosphere",
      generatePrompt: "A beautiful starlit night sky with soft moonlight, gentle clouds, a peaceful meadow below, and reflective thinking-of-you atmosphere",
    },
  ],
  "good-luck": [
    {
      id: "golden-stars",
      name: "Golden Stars",
      icon: "⭐",
      editPrompt: "Transform this photo with golden shooting stars, sparkles, warm hopeful lighting, and an encouraging good luck atmosphere",
      generatePrompt: "Golden shooting stars across a twilight sky with sparkles, four-leaf clover, warm hopeful lighting, and encouraging good luck atmosphere",
    },
    {
      id: "fresh-horizons",
      name: "Fresh Horizons",
      icon: "🌅",
      editPrompt: "Transform this photo into a fresh sunrise horizons scene with optimistic warm colors and an uplifting good luck wishing atmosphere",
      generatePrompt: "A fresh sunrise over new horizons with optimistic warm colors, open road ahead, bright sky, and uplifting good luck wishing atmosphere",
    },
    {
      id: "lucky-charm",
      name: "Lucky Charm",
      icon: "🍀",
      editPrompt: "Transform this photo with lucky charm elements like four-leaf clovers, golden horseshoes, cheerful colors, and a whimsical good luck atmosphere",
      generatePrompt: "A whimsical good luck scene with four-leaf clovers, golden horseshoe, rainbow, cheerful bright colors, and encouraging lucky charm atmosphere",
    },
  ],
  "miss-you": [
    {
      id: "twilight-dreamy",
      name: "Twilight Dreamy",
      icon: "🌙",
      editPrompt: "Transform this photo into a dreamy twilight scene with soft purple and blue tones, gentle stars, and a tender missing-you atmosphere",
      generatePrompt: "A dreamy twilight scene with soft purple and blue tones, gentle stars, a solitary bench overlooking water, tender missing-you atmosphere",
    },
    {
      id: "vintage-memory",
      name: "Vintage Memory",
      icon: "📸",
      editPrompt: "Transform this photo into a nostalgic vintage memory style with warm faded tones, soft vignette, and a sentimental missing-you atmosphere",
      generatePrompt: "A nostalgic vintage photograph style with warm faded tones, old photo album, pressed flowers, and sentimental missing-you atmosphere",
    },
    {
      id: "distant-horizons",
      name: "Distant Horizons",
      icon: "🌊",
      editPrompt: "Transform this photo into a distant horizons scene with vast ocean or landscape, warm sunset light, and a longing missing-you atmosphere",
      generatePrompt: "A distant ocean horizon with warm sunset light, gentle waves, a message in a bottle on the shore, longing missing-you atmosphere",
    },
  ],
  sorry: [
    {
      id: "gentle-peace",
      name: "Gentle Peace",
      icon: "🕊️",
      editPrompt: "Transform this photo into a gentle peaceful scene with soft muted tones, white dove, olive branch, and a sincere apologetic atmosphere",
      generatePrompt: "A gentle peaceful scene with a white dove carrying an olive branch, soft muted tones, delicate flowers, sincere apologetic atmosphere",
    },
    {
      id: "soft-rain",
      name: "After the Rain",
      icon: "🌈",
      editPrompt: "Transform this photo into an after-the-rain scene with a rainbow, fresh raindrops on flowers, and a hopeful reconciliation atmosphere",
      generatePrompt: "A beautiful rainbow after rain with fresh raindrops on flowers, clearing sky, renewed hope, gentle reconciliation and sorry atmosphere",
    },
    {
      id: "heartfelt-blooms",
      name: "Heartfelt Blooms",
      icon: "💐",
      editPrompt: "Transform this photo with a heartfelt bouquet of soft flowers, gentle warm tones, and a sincere apologetic atmosphere",
      generatePrompt: "A heartfelt bouquet of soft pink and white flowers with gentle warm tones, a handwritten note, sincere and apologetic atmosphere",
    },
  ],
  custom: [
    {
      id: "elegant",
      name: "Elegant",
      icon: "✨",
      editPrompt: "Transform this photo into an elegant refined style with warm golden lighting, sophisticated composition, and a premium celebratory atmosphere",
      generatePrompt: "An elegant refined celebration scene with warm golden lighting, sophisticated floral arrangements, and a premium celebratory atmosphere",
    },
    {
      id: "whimsical",
      name: "Whimsical",
      icon: "🎨",
      editPrompt: "Transform this photo into a whimsical illustrated style with playful colors, creative artistic elements, and a cheerful fun atmosphere",
      generatePrompt: "A whimsical illustrated scene with playful colors, creative artistic elements, floating bubbles, confetti, and cheerful fun atmosphere",
    },
    {
      id: "minimalist",
      name: "Minimalist",
      icon: "◻️",
      editPrompt: "Transform this photo into a clean minimalist style with soft neutral tones, simple elegant composition, and a refined understated atmosphere",
      generatePrompt: "A clean minimalist design with soft neutral tones, simple elegant floral arrangement, plenty of white space, and refined understated atmosphere",
    },
    {
      id: "vintage",
      name: "Vintage",
      icon: "📸",
      editPrompt: "Transform this photo into a warm vintage style with nostalgic film tones, gentle grain, classic composition, and a timeless sentimental atmosphere",
      generatePrompt: "A warm vintage scene with nostalgic film tones, gentle grain, classic roses in a vase, soft sunlight through a window, timeless atmosphere",
    },
  ],
};

// ─── Example Card Designs (per occasion) ──────────────────────────────
export interface ExampleCard {
  id: string;
  label: string;
  description: string;
  thumbnailUrl: string; // path to static asset in /public/examples/
  prompt: string; // hidden prompt for generating a similar image
}

export const OCCASION_EXAMPLES: Record<OccasionKey, ExampleCard[]> = {
  birthday: [
    {
      id: "birthday-cake",
      label: "Birthday Cake",
      description: "Colorful cake with candles",
      thumbnailUrl: "/examples/birthday-cake.webp",
      prompt: "A beautiful birthday cake with colorful lit candles and festive sprinkle decorations, warm golden lighting, celebration atmosphere, confetti falling softly",
    },
    {
      id: "birthday-balloons",
      label: "Party Balloons",
      description: "Festive balloons and confetti",
      thumbnailUrl: "/examples/birthday-balloons.webp",
      prompt: "Colorful birthday balloons floating in a bright sunny sky with confetti and streamers, joyful celebration party atmosphere, vibrant and festive",
    },
    {
      id: "birthday-gifts",
      label: "Gift Boxes",
      description: "Elegant wrapped presents",
      thumbnailUrl: "/examples/birthday-gifts.webp",
      prompt: "An elegant arrangement of beautifully wrapped birthday presents with golden ribbons, surrounded by party decorations, warm festive lighting",
    },
  ],
  wedding: [
    {
      id: "wedding-rings",
      label: "Wedding Rings",
      description: "Elegant golden rings",
      thumbnailUrl: "/examples/wedding-rings.webp",
      prompt: "Two intertwined golden wedding rings on a bed of white rose petals with soft bokeh lighting, elegant and romantic wedding atmosphere",
    },
    {
      id: "wedding-bouquet",
      label: "Bridal Bouquet",
      description: "Beautiful floral arrangement",
      thumbnailUrl: "/examples/wedding-bouquet.webp",
      prompt: "A stunning bridal bouquet of white roses and peonies with soft greenery, romantic soft lighting, elegant wedding celebration atmosphere",
    },
    {
      id: "wedding-arch",
      label: "Wedding Arch",
      description: "Flower-decorated ceremony arch",
      thumbnailUrl: "/examples/wedding-arch.webp",
      prompt: "A beautiful outdoor wedding arch decorated with white flowers and flowing fabric in a garden setting, dreamy romantic atmosphere with soft sunlight",
    },
  ],
  "baby-shower": [
    {
      id: "baby-nursery",
      label: "Cozy Nursery",
      description: "Adorable baby room",
      thumbnailUrl: "/examples/baby-nursery.webp",
      prompt: "An adorable baby nursery with pastel colors, soft plush toys, a beautiful wooden crib with stars mobile, gentle warm lighting, sweet nurturing atmosphere",
    },
    {
      id: "baby-stork",
      label: "Stork Delivery",
      description: "Classic stork with bundle",
      thumbnailUrl: "/examples/baby-stork.webp",
      prompt: "A sweet illustration of a stork carrying a baby bundle through a dreamy pastel sky with soft clouds and gentle sunshine, whimsical and heartwarming",
    },
    {
      id: "baby-items",
      label: "Baby Items",
      description: "Cute baby accessories",
      thumbnailUrl: "/examples/baby-items.webp",
      prompt: "Cute baby items beautifully arranged with pastel balloons, tiny booties, pacifier, and soft toys, gentle pastel colors and warm lighting",
    },
  ],
  "get-well": [
    {
      id: "getwell-flowers",
      label: "Bright Flowers",
      description: "Cheerful sunflower bouquet",
      thumbnailUrl: "/examples/getwell-flowers.webp",
      prompt: "A bright cheerful bouquet of sunflowers and daisies in warm sunshine, hopeful and uplifting, gentle healing atmosphere with soft golden light",
    },
    {
      id: "getwell-garden",
      label: "Peaceful Garden",
      description: "Serene garden scene",
      thumbnailUrl: "/examples/getwell-garden.webp",
      prompt: "A peaceful garden scene with blooming flowers, butterflies, and soft sunlight streaming through, serene calming healing atmosphere",
    },
    {
      id: "getwell-cozy",
      label: "Cozy Window",
      description: "Warm tea and flowers",
      thumbnailUrl: "/examples/getwell-cozy.webp",
      prompt: "A cozy window scene with warm herbal tea, fresh flowers in a vase, and soft sunlight streaming in, comforting and restful get-well atmosphere",
    },
  ],
  congratulations: [
    {
      id: "congrats-trophy",
      label: "Gold Trophy",
      description: "Achievement celebration",
      thumbnailUrl: "/examples/congrats-trophy.webp",
      prompt: "A gleaming golden trophy with confetti and streamers raining down, grand celebration of achievement, sparkling golden light atmosphere",
    },
    {
      id: "congrats-fireworks",
      label: "Fireworks",
      description: "Spectacular night display",
      thumbnailUrl: "/examples/congrats-fireworks.webp",
      prompt: "Spectacular fireworks exploding in a dark night sky with golden sparkles and colorful bursts, grand celebration atmosphere",
    },
    {
      id: "congrats-champagne",
      label: "Champagne Toast",
      description: "Elegant celebration toast",
      thumbnailUrl: "/examples/congrats-champagne.webp",
      prompt: "An elegant champagne toast with golden bubbles rising, sophisticated celebration setting with roses and golden confetti, luxurious atmosphere",
    },
  ],
  "thank-you": [
    {
      id: "thankyou-flowers",
      label: "Thank You Flowers",
      description: "Beautiful floral arrangement",
      thumbnailUrl: "/examples/thankyou-flowers.webp",
      prompt: "A beautiful floral arrangement with mixed colorful flowers surrounding a heartfelt scene, warm grateful golden light, elegant thank-you atmosphere",
    },
    {
      id: "thankyou-gift",
      label: "Gift of Thanks",
      description: "Heartfelt gift scene",
      thumbnailUrl: "/examples/thankyou-gift.webp",
      prompt: "A heartfelt gift box with a beautiful bow, surrounded by flowers and warm golden light, soft bokeh background, sincere grateful atmosphere",
    },
    {
      id: "thankyou-calligraphy",
      label: "Elegant Script",
      description: "Beautiful calligraphy design",
      thumbnailUrl: "/examples/thankyou-calligraphy.webp",
      prompt: "Elegant floral calligraphy-style design with refined decorative borders, beautiful mixed flowers, and sophisticated grateful thank-you atmosphere",
    },
  ],
  christmas: [
    {
      id: "christmas-tree",
      label: "Christmas Tree",
      description: "Magical decorated tree",
      thumbnailUrl: "/examples/christmas-tree.webp",
      prompt: "A magical Christmas tree with twinkling warm lights, beautiful ornaments, presents underneath, cozy winter scene with soft snowfall outside",
    },
    {
      id: "christmas-village",
      label: "Snow Village",
      description: "Cozy winter wonderland",
      thumbnailUrl: "/examples/christmas-village.webp",
      prompt: "A cozy snowy village on Christmas Eve with warm lights glowing from windows, snow-covered rooftops, gentle snowfall, and magical winter atmosphere",
    },
    {
      id: "christmas-santa",
      label: "Santa's Flight",
      description: "Santa over moonlit village",
      thumbnailUrl: "/examples/christmas-santa.webp",
      prompt: "Santa's sleigh flying over a moonlit snowy village on Christmas Eve, reindeer silhouettes against a bright full moon, magical holiday atmosphere",
    },
  ],
  valentines: [
    {
      id: "valentines-roses",
      label: "Red Roses",
      description: "Classic romantic roses",
      thumbnailUrl: "/examples/valentines-roses.webp",
      prompt: "Beautiful red roses with soft hearts and romantic pink lighting, Valentine's Day atmosphere with gentle bokeh, passionate and tender",
    },
    {
      id: "valentines-sunset",
      label: "Romantic Sunset",
      description: "Heart-shaped clouds at sunset",
      thumbnailUrl: "/examples/valentines-sunset.webp",
      prompt: "A romantic sunset scene with heart-shaped clouds and warm golden-pink light, Valentine's Day atmosphere, dreamy and passionate",
    },
    {
      id: "valentines-letter",
      label: "Love Letter",
      description: "Elegant love letter scene",
      thumbnailUrl: "/examples/valentines-letter.webp",
      prompt: "An elegant love letter with red roses, chocolate hearts, and candlelight, romantic Valentine's Day atmosphere with warm soft lighting",
    },
  ],
  condolences: [
    {
      id: "condolences-lily",
      label: "White Lily",
      description: "Peaceful lily with candlelight",
      thumbnailUrl: "/examples/condolences-lily.webp",
      prompt: "A single white lily with soft candlelight, peaceful and serene memorial atmosphere, gentle warm lighting, respectful and comforting",
    },
    {
      id: "condolences-sunset",
      label: "Peaceful Sunset",
      description: "Serene sunset over water",
      thumbnailUrl: "/examples/condolences-sunset.webp",
      prompt: "A peaceful sunset over calm still water with soft golden and purple light, tranquil and comforting memorial atmosphere, serene and respectful",
    },
    {
      id: "condolences-flowers",
      label: "White Flowers",
      description: "Gentle memorial flowers",
      thumbnailUrl: "/examples/condolences-flowers.webp",
      prompt: "White flowers arranged gently with soft candle light, serene and respectful memorial scene, peaceful calming atmosphere",
    },
  ],
  anniversary: [
    {
      id: "anniversary-roses",
      label: "Roses & Champagne",
      description: "Elegant celebration",
      thumbnailUrl: "/examples/anniversary-roses.webp",
      prompt: "Red roses with champagne glasses and a golden anniversary celebration, elegant warm lighting, romantic and timeless love atmosphere",
    },
    {
      id: "anniversary-dinner",
      label: "Romantic Dinner",
      description: "Candlelit dinner setting",
      thumbnailUrl: "/examples/anniversary-dinner.webp",
      prompt: "A romantic candlelit dinner setting with roses, wine glasses, and starlight, intimate elegant anniversary celebration atmosphere",
    },
    {
      id: "anniversary-hearts",
      label: "Hearts & Gold",
      description: "Intertwined hearts with roses",
      thumbnailUrl: "/examples/anniversary-hearts.webp",
      prompt: "Two hearts intertwined with red roses and golden decorations, timeless love anniversary celebration, warm romantic atmosphere",
    },
  ],
  "mothers-day": [
    {
      id: "mothersday-bouquet",
      label: "Flower Bouquet",
      description: "Beautiful spring bouquet for Mom",
      thumbnailUrl: "/examples/mothersday-bouquet.webp",
      prompt: "A stunning bouquet of pink roses, peonies and spring flowers wrapped with a ribbon, warm soft lighting, loving Mother's Day atmosphere",
    },
    {
      id: "mothersday-garden",
      label: "Mother's Garden",
      description: "Serene garden with blooming flowers",
      thumbnailUrl: "/examples/mothersday-garden.webp",
      prompt: "A serene mother's garden with blooming roses, tulips and lavender, garden bench with a sun hat, warm golden sunlight, peaceful Mother's Day atmosphere",
    },
    {
      id: "mothersday-tea",
      label: "Tea & Flowers",
      description: "Elegant tea setting with flowers",
      thumbnailUrl: "/examples/mothersday-tea.webp",
      prompt: "An elegant tea setting with fine china, fresh flowers, pastries, and warm golden morning light, sophisticated and loving Mother's Day atmosphere",
    },
  ],
  "fathers-day": [
    {
      id: "fathersday-study",
      label: "Dad's Study",
      description: "Classic gentleman's study",
      thumbnailUrl: "/examples/fathersday-study.webp",
      prompt: "A classic gentleman's study with leather-bound books, a fine pocket watch, warm desk lamp, and distinguished refined Father's Day atmosphere",
    },
    {
      id: "fathersday-outdoors",
      label: "Great Outdoors",
      description: "Scenic nature adventure",
      thumbnailUrl: "/examples/fathersday-outdoors.webp",
      prompt: "A scenic mountain landscape with a lake at golden hour, fishing rod and tackle box, outdoor adventure, warm Father's Day atmosphere",
    },
    {
      id: "fathersday-tools",
      label: "Dad's Workshop",
      description: "Rustic workshop scene",
      thumbnailUrl: "/examples/fathersday-tools.webp",
      prompt: "A rustic woodworking workshop with warm lighting, quality tools on a workbench, sawdust and craftsmanship, heartfelt Father's Day atmosphere",
    },
  ],
  graduation: [
    {
      id: "grad-cap",
      label: "Cap & Diploma",
      description: "Classic graduation symbols",
      thumbnailUrl: "/examples/grad-cap.webp",
      prompt: "A graduation mortarboard cap and rolled diploma with golden tassel, confetti and streamers, triumphant academic achievement celebration atmosphere",
    },
    {
      id: "grad-celebration",
      label: "Celebration",
      description: "Joyful cap toss moment",
      thumbnailUrl: "/examples/grad-celebration.webp",
      prompt: "Graduation caps tossed in the air against a bright blue sky, confetti falling, joyful celebration of academic achievement atmosphere",
    },
    {
      id: "grad-future",
      label: "Bright Future",
      description: "Sunrise over new horizons",
      thumbnailUrl: "/examples/grad-future.webp",
      prompt: "A beautiful sunrise over an open road stretching toward the horizon, golden light, a bright future ahead, inspiring graduation atmosphere",
    },
  ],
  "new-home": [
    {
      id: "newhome-key",
      label: "Golden Key",
      description: "Key to your new home",
      thumbnailUrl: "/examples/newhome-key.webp",
      prompt: "A golden house key with a ribbon bow in front of a beautiful home's front door, flowers and welcome mat, celebratory new home atmosphere",
    },
    {
      id: "newhome-cottage",
      label: "Dream Cottage",
      description: "Charming home with garden",
      thumbnailUrl: "/examples/newhome-cottage.webp",
      prompt: "A charming cottage with a flowering garden, white picket fence, warm glowing windows at dusk, welcoming new home housewarming atmosphere",
    },
    {
      id: "newhome-interior",
      label: "Cozy Living Room",
      description: "Warm welcoming interior",
      thumbnailUrl: "/examples/newhome-interior.webp",
      prompt: "A cozy living room with warm fireplace, comfortable sofa, fresh flowers, soft lighting, welcoming and warm new home housewarming atmosphere",
    },
  ],
  "new-job": [
    {
      id: "newjob-desk",
      label: "Fresh Start",
      description: "New desk, new beginnings",
      thumbnailUrl: "/examples/newjob-desk.webp",
      prompt: "A fresh modern desk setup with a city view, coffee cup, notebook, and fresh flowers, optimistic morning light, exciting new job atmosphere",
    },
    {
      id: "newjob-skyline",
      label: "City Skyline",
      description: "New opportunities ahead",
      thumbnailUrl: "/examples/newjob-skyline.webp",
      prompt: "A stunning city skyline at sunrise with golden light, new opportunities ahead, confident and exciting new career beginning atmosphere",
    },
    {
      id: "newjob-celebration",
      label: "Celebration Toast",
      description: "Cheers to the new role",
      thumbnailUrl: "/examples/newjob-celebration.webp",
      prompt: "A celebration toast with confetti and champagne glasses, bright colorful streamers, congratulatory new job achievement atmosphere",
    },
  ],
  retirement: [
    {
      id: "retirement-sunset",
      label: "Golden Sunset",
      description: "Peaceful sunset scene",
      thumbnailUrl: "/examples/retirement-sunset.webp",
      prompt: "A peaceful golden sunset over a calm ocean, a sailboat on gentle waves, warm amber tones, serene and celebratory retirement atmosphere",
    },
    {
      id: "retirement-garden",
      label: "Garden Paradise",
      description: "Relaxing garden retreat",
      thumbnailUrl: "/examples/retirement-garden.webp",
      prompt: "A beautiful garden retreat with blooming flowers, a comfortable bench under a tree, birds singing, peaceful retirement paradise atmosphere",
    },
    {
      id: "retirement-toast",
      label: "Elegant Toast",
      description: "Distinguished celebration",
      thumbnailUrl: "/examples/retirement-toast.webp",
      prompt: "An elegant retirement celebration with champagne, golden accents, refined floral arrangements, warm lighting, distinguished achievement atmosphere",
    },
  ],
  engagement: [
    {
      id: "engagement-ring",
      label: "Diamond Ring",
      description: "Sparkling engagement ring",
      thumbnailUrl: "/examples/engagement-ring.webp",
      prompt: "A sparkling diamond engagement ring on a bed of rose petals, soft bokeh lights, romantic champagne nearby, enchanting engagement atmosphere",
    },
    {
      id: "engagement-roses",
      label: "Romantic Roses",
      description: "Roses and champagne",
      thumbnailUrl: "/examples/engagement-roses.webp",
      prompt: "Beautiful red roses with champagne and a diamond ring, romantic pink and gold lighting, enchanting engagement celebration atmosphere",
    },
    {
      id: "engagement-sunset",
      label: "Sunset Proposal",
      description: "Romantic sunset moment",
      thumbnailUrl: "/examples/engagement-sunset.webp",
      prompt: "A romantic sunset scene with golden light, two silhouettes overlooking the ocean, dreamy and passionate engagement proposal atmosphere",
    },
  ],
  "new-baby": [
    {
      id: "newbaby-crib",
      label: "Sweet Crib",
      description: "Adorable nursery scene",
      thumbnailUrl: "/examples/newbaby-crib.webp",
      prompt: "An adorable nursery with a beautiful crib, soft pastel colors, gentle star mobile, plush toys, warm loving new baby welcome atmosphere",
    },
    {
      id: "newbaby-feet",
      label: "Tiny Feet",
      description: "Precious baby details",
      thumbnailUrl: "/examples/newbaby-feet.webp",
      prompt: "Tiny baby booties and a soft blanket with gentle pastel flowers, warm soft lighting, precious and tender new baby welcome atmosphere",
    },
    {
      id: "newbaby-stork",
      label: "Special Delivery",
      description: "Stork with baby bundle",
      thumbnailUrl: "/examples/newbaby-stork.webp",
      prompt: "A whimsical illustration of a stork delivering a baby bundle through a dreamy pastel sky, gentle clouds, heartwarming new baby atmosphere",
    },
  ],
  easter: [
    {
      id: "easter-eggs",
      label: "Easter Eggs",
      description: "Decorated eggs in a basket",
      thumbnailUrl: "/examples/easter-eggs.webp",
      prompt: "Beautifully decorated Easter eggs in a woven basket with spring flowers, soft pastel colors, fresh dewy grass, cheerful Easter atmosphere",
    },
    {
      id: "easter-bunny",
      label: "Easter Bunny",
      description: "Cute bunny in garden",
      thumbnailUrl: "/examples/easter-bunny.webp",
      prompt: "A cute fluffy Easter bunny in a blooming spring garden with decorated eggs, colorful flowers, sunshine, whimsical Easter atmosphere",
    },
    {
      id: "easter-spring",
      label: "Spring Bloom",
      description: "Beautiful spring flowers",
      thumbnailUrl: "/examples/easter-spring.webp",
      prompt: "Beautiful spring flowers blooming with cherry blossoms, tulips, daffodils, butterflies, and bright cheerful Easter spring atmosphere",
    },
  ],
  "new-year": [
    {
      id: "newyear-fireworks",
      label: "Midnight Fireworks",
      description: "Spectacular celebration",
      thumbnailUrl: "/examples/newyear-fireworks.webp",
      prompt: "Spectacular midnight fireworks over a city skyline, golden and colorful bursts, New Year's Eve celebration atmosphere, festive and exciting",
    },
    {
      id: "newyear-champagne",
      label: "Champagne Toast",
      description: "Elegant midnight toast",
      thumbnailUrl: "/examples/newyear-champagne.webp",
      prompt: "An elegant champagne toast at midnight with golden bubbles, clock striking twelve, sparklers, glamorous New Year's Eve celebration atmosphere",
    },
    {
      id: "newyear-countdown",
      label: "Golden Clock",
      description: "Countdown to midnight",
      thumbnailUrl: "/examples/newyear-countdown.webp",
      prompt: "A vintage golden clock approaching midnight with golden confetti, champagne, festive decorations, exciting New Year countdown atmosphere",
    },
  ],
  halloween: [
    {
      id: "halloween-pumpkins",
      label: "Jack-o-Lanterns",
      description: "Glowing carved pumpkins",
      thumbnailUrl: "/examples/halloween-pumpkins.webp",
      prompt: "Glowing jack-o-lanterns on a porch with autumn leaves, candle light, mysterious foggy evening, fun spooky Halloween atmosphere",
    },
    {
      id: "halloween-haunted",
      label: "Haunted House",
      description: "Spooky mansion at night",
      thumbnailUrl: "/examples/halloween-haunted.webp",
      prompt: "A spooky haunted mansion under a full moon with bats flying, atmospheric fog, bare trees, enchantingly mysterious Halloween atmosphere",
    },
    {
      id: "halloween-treats",
      label: "Trick or Treat",
      description: "Candy and costumes fun",
      thumbnailUrl: "/examples/halloween-treats.webp",
      prompt: "A fun Halloween trick-or-treat scene with candy, pumpkin bucket, autumn decorations, colorful leaves, festive and playful Halloween atmosphere",
    },
  ],
  thanksgiving: [
    {
      id: "thanksgiving-feast",
      label: "Family Feast",
      description: "Beautiful harvest table",
      thumbnailUrl: "/examples/thanksgiving-feast.webp",
      prompt: "A beautiful Thanksgiving feast table with roasted turkey, autumn decorations, pumpkins, candles, warm golden lighting, grateful atmosphere",
    },
    {
      id: "thanksgiving-harvest",
      label: "Autumn Harvest",
      description: "Cornucopia of plenty",
      thumbnailUrl: "/examples/thanksgiving-harvest.webp",
      prompt: "An abundant autumn harvest cornucopia with fruits, vegetables, golden wheat, fall leaves, warm amber tones, grateful Thanksgiving atmosphere",
    },
    {
      id: "thanksgiving-pumpkins",
      label: "Pumpkin Patch",
      description: "Rustic pumpkin scene",
      thumbnailUrl: "/examples/thanksgiving-pumpkins.webp",
      prompt: "A rustic pumpkin patch with colorful autumn leaves, hay bales, warm golden sunset light, cozy and grateful Thanksgiving atmosphere",
    },
  ],
  "thinking-of-you": [
    {
      id: "thinking-flowers",
      label: "Gentle Wildflowers",
      description: "Soft wildflower meadow",
      thumbnailUrl: "/examples/thinking-flowers.webp",
      prompt: "Soft wildflowers in a gentle meadow with warm sunlight, butterflies, peaceful and calming, warm thoughtful thinking-of-you atmosphere",
    },
    {
      id: "thinking-window",
      label: "Window Moment",
      description: "Cozy window scene",
      thumbnailUrl: "/examples/thinking-window.webp",
      prompt: "A cozy window scene with a cup of tea, rain gently falling outside, warm blanket, fresh flowers, caring thinking-of-you atmosphere",
    },
    {
      id: "thinking-stars",
      label: "Under the Stars",
      description: "Peaceful starlit scene",
      thumbnailUrl: "/examples/thinking-stars.webp",
      prompt: "A peaceful scene under a starlit sky with soft moonlight, a gentle meadow, fireflies, warm and reflective thinking-of-you atmosphere",
    },
  ],
  "good-luck": [
    {
      id: "goodluck-clover",
      label: "Lucky Clover",
      description: "Four-leaf clover charm",
      thumbnailUrl: "/examples/goodluck-clover.webp",
      prompt: "A beautiful four-leaf clover with golden sparkles, dewy morning light, fresh green meadow, lucky charm and encouraging good luck atmosphere",
    },
    {
      id: "goodluck-sunrise",
      label: "New Dawn",
      description: "Hopeful sunrise ahead",
      thumbnailUrl: "/examples/goodluck-sunrise.webp",
      prompt: "A hopeful sunrise over a beautiful landscape, golden light illuminating the path ahead, birds in flight, encouraging good luck atmosphere",
    },
    {
      id: "goodluck-stars",
      label: "Wishing Stars",
      description: "Shooting stars in the sky",
      thumbnailUrl: "/examples/goodluck-stars.webp",
      prompt: "Golden shooting stars across a twilight sky, magical sparkles, wishes coming true, hopeful and encouraging good luck atmosphere",
    },
  ],
  "miss-you": [
    {
      id: "missyou-moon",
      label: "Same Moon",
      description: "Under the same moonlight",
      thumbnailUrl: "/examples/missyou-moon.webp",
      prompt: "A beautiful full moon over calm water with soft reflections, gentle twilight, two distant shores connected by moonlight, tender missing-you atmosphere",
    },
    {
      id: "missyou-letter",
      label: "Love Letter",
      description: "Heartfelt written words",
      thumbnailUrl: "/examples/missyou-letter.webp",
      prompt: "A handwritten love letter with pressed flowers, vintage pen, warm candlelight, nostalgic and tender missing-you atmosphere",
    },
    {
      id: "missyou-sunset",
      label: "Distant Sunset",
      description: "Sunset over the horizon",
      thumbnailUrl: "/examples/missyou-sunset.webp",
      prompt: "A warm sunset over a distant horizon with gentle clouds, a solitary tree silhouette, warm amber light, longing missing-you atmosphere",
    },
  ],
  sorry: [
    {
      id: "sorry-dove",
      label: "Peace Dove",
      description: "Gentle white dove",
      thumbnailUrl: "/examples/sorry-dove.webp",
      prompt: "A gentle white dove carrying an olive branch, soft muted tones, delicate flowers, peaceful sky, sincere apologetic atmosphere",
    },
    {
      id: "sorry-rainbow",
      label: "After the Storm",
      description: "Rainbow of hope",
      thumbnailUrl: "/examples/sorry-rainbow.webp",
      prompt: "A beautiful rainbow appearing after rain with fresh raindrops on flowers, clearing clouds, renewed hope, gentle reconciliation atmosphere",
    },
    {
      id: "sorry-flowers",
      label: "Gentle Bouquet",
      description: "Soft apology flowers",
      thumbnailUrl: "/examples/sorry-flowers.webp",
      prompt: "A gentle bouquet of soft pink and white flowers with a heartfelt note, warm soft lighting, sincere and tender apology atmosphere",
    },
  ],
  custom: [
    {
      id: "custom-elegant",
      label: "Elegant Floral",
      description: "Sophisticated flower arrangement",
      thumbnailUrl: "/examples/custom-elegant.webp",
      prompt: "An elegant sophisticated floral arrangement with warm golden lighting, refined composition, beautiful mixed flowers, premium celebration atmosphere",
    },
    {
      id: "custom-whimsical",
      label: "Whimsical Fun",
      description: "Playful artistic design",
      thumbnailUrl: "/examples/custom-whimsical.webp",
      prompt: "A whimsical playful scene with colorful confetti, balloons, sparkles, creative artistic elements, cheerful and fun celebration atmosphere",
    },
    {
      id: "custom-nature",
      label: "Nature Scene",
      description: "Beautiful natural landscape",
      thumbnailUrl: "/examples/custom-nature.webp",
      prompt: "A beautiful natural landscape with soft golden light, blooming wildflowers, gentle stream, peaceful and heartfelt nature atmosphere",
    },
  ],
};

export type PackageKey = "basic" | "voice" | "music" | "full" | "story";

export interface PackageInfo {
  name: string;
  price: number; // in cents
  priceDisplay: string;
  description: string;
  features: string[];
  includes: {
    image: boolean;
    voice: boolean;
    music: boolean;
  };
  // Media entitlements. A maxImages above 1 turns the image step into a
  // Memory Lane timeline ("full" gets a short one, "story" the long one);
  // multi-track soundtracks stay a "story" perk. Owner/admin cards bypass
  // these (see StudioLayout).
  maxImages: number;
  maxTracks: number;
}

export const PACKAGES: Record<PackageKey, PackageInfo> = {
  basic: {
    name: "Basic Card",
    price: 199,
    priceDisplay: "$1.99",
    description: "AI-generated image with your personal message",
    features: [
      "AI-generated card image",
      "Custom text message",
      "3 image re-generations",
      "Shareable link",
    ],
    includes: { image: true, voice: false, music: false },
    maxImages: 1,
    maxTracks: 0,
  },
  voice: {
    name: "Card + Voice",
    price: 299,
    priceDisplay: "$2.99",
    description: "Add your personal voice recording to the card",
    features: [
      "Everything in Basic",
      "Voice recording",
      "Auto-plays on card open",
    ],
    includes: { image: true, voice: true, music: false },
    maxImages: 1,
    maxTracks: 0,
  },
  music: {
    name: "Card + Music",
    price: 399,
    priceDisplay: "$3.99",
    description: "Add AI-generated music to set the mood",
    features: [
      "Everything in Basic",
      "AI-generated custom music",
      "Background music on card open",
    ],
    includes: { image: true, voice: false, music: true },
    maxImages: 1,
    maxTracks: 1,
  },
  full: {
    name: "Full Experience",
    price: 499,
    priceDisplay: "$4.99",
    description: "Up to three photos with voice and music",
    features: [
      "AI-generated card image",
      "Up to 3 photos",
      "Custom text message",
      "Voice recording",
      "AI-generated music",
      "Best value",
    ],
    includes: { image: true, voice: true, music: true },
    maxImages: 3,
    maxTracks: 1,
  },
  story: {
    name: "Story",
    price: 799,
    priceDisplay: "$7.99",
    description:
      "A scroll-through Memory Lane of photos with voice and a full soundtrack",
    features: [
      "Everything in Full",
      "Up to 20 photos as a scrolling story",
      "Captions & date labels per photo",
      "Up to 3 AI music tracks (play in sequence)",
      "Our most magical experience",
    ],
    includes: { image: true, voice: true, music: true },
    maxImages: 20,
    maxTracks: 3,
  },
} as const;

export const MAX_IMAGE_REGENERATIONS = 3;

export interface OccasionInfo {
  name: string;
  slug: OccasionKey;
  icon: string;
  description: string;
  defaultParticles: string;
  defaultMusicPrompt: string;
  suggestedImagePrompts: string[];
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

export const OCCASIONS: OccasionInfo[] = [
  {
    name: "Birthday",
    slug: "birthday",
    icon: "🎂",
    description: "Celebrate their special day",
    defaultParticles: "confetti",
    defaultMusicPrompt:
      "Upbeat, celebratory pop music, birthday party vibes, joyful and festive",
    suggestedImagePrompts: [
      "A beautiful birthday cake with colorful candles and festive decorations, warm lighting, celebration atmosphere",
      "Colorful birthday balloons floating in a sunny sky with confetti, joyful celebration",
      "An elegant birthday party scene with gifts, streamers, and golden decorations",
    ],
    colorScheme: {
      primary: "#FF6B6B",
      secondary: "#4ECDC4",
      accent: "#FFE66D",
      background: "#FFF9E6",
    },
  },
  {
    name: "Wedding",
    slug: "wedding",
    icon: "💍",
    description: "Congratulate the happy couple",
    defaultParticles: "hearts",
    defaultMusicPrompt:
      "Romantic, orchestral, elegant wedding music, graceful and beautiful",
    suggestedImagePrompts: [
      "Elegant wedding scene with white roses, golden rings, and soft romantic lighting",
      "A beautiful wedding arch decorated with flowers in a garden setting, dreamy atmosphere",
      "Two intertwined wedding rings on a bed of rose petals with soft bokeh lighting",
    ],
    colorScheme: {
      primary: "#E8D5B7",
      secondary: "#F5E6CC",
      accent: "#C9A96E",
      background: "#FFF8F0",
    },
  },
  {
    name: "Baby Shower",
    slug: "baby-shower",
    icon: "👶",
    description: "Welcome the little one",
    defaultParticles: "bubbles",
    defaultMusicPrompt:
      "Gentle, soft lullaby music, warm and tender, sweet and calming",
    suggestedImagePrompts: [
      "Adorable baby nursery with pastel colors, soft toys, and gentle lighting",
      "Cute baby items arranged beautifully with pastel balloons and soft decorations",
      "A sweet stork carrying a baby bundle through a dreamy pastel sky",
    ],
    colorScheme: {
      primary: "#B5D8EB",
      secondary: "#F8C8DC",
      accent: "#E8E8A6",
      background: "#F5F9FF",
    },
  },
  {
    name: "Get Well Soon",
    slug: "get-well",
    icon: "🌻",
    description: "Send healing thoughts",
    defaultParticles: "butterflies",
    defaultMusicPrompt:
      "Calm, hopeful acoustic music, uplifting and soothing, gentle guitar",
    suggestedImagePrompts: [
      "A bright bouquet of sunflowers and daisies in warm sunshine, hopeful and uplifting",
      "A peaceful garden scene with butterflies and blooming flowers, serene healing atmosphere",
      "A cozy window scene with warm tea, flowers, and soft sunlight streaming in",
    ],
    colorScheme: {
      primary: "#FFD93D",
      secondary: "#6BCB77",
      accent: "#FF8C42",
      background: "#FFFBEB",
    },
  },
  {
    name: "Congratulations",
    slug: "congratulations",
    icon: "🎉",
    description: "Celebrate their achievement",
    defaultParticles: "gold-confetti",
    defaultMusicPrompt:
      "Triumphant, uplifting music with brass instruments, celebratory and grand",
    suggestedImagePrompts: [
      "A golden trophy with confetti and streamers, celebration of achievement",
      "Fireworks exploding in a night sky with golden sparkles, grand celebration",
      "A champagne toast with golden bubbles and elegant celebration atmosphere",
    ],
    colorScheme: {
      primary: "#FFD700",
      secondary: "#FF6B35",
      accent: "#1A535C",
      background: "#FFFCE8",
    },
  },
  {
    name: "Thank You",
    slug: "thank-you",
    icon: "🙏",
    description: "Express your gratitude",
    defaultParticles: "stars",
    defaultMusicPrompt:
      "Warm, grateful folk music, heartfelt acoustic, gentle and sincere",
    suggestedImagePrompts: [
      "A beautiful handwritten 'Thank You' surrounded by flowers and warm colors",
      "A heartfelt scene with a gift box, flowers, and warm golden light",
      "Elegant floral arrangement with a thank you note in beautiful calligraphy",
    ],
    colorScheme: {
      primary: "#7B68EE",
      secondary: "#98D8C8",
      accent: "#F67280",
      background: "#F8F5FF",
    },
  },
  {
    name: "Christmas",
    slug: "christmas",
    icon: "🎄",
    description: "Spread holiday cheer",
    defaultParticles: "snowflakes",
    defaultMusicPrompt:
      "Classic Christmas orchestral music, warm and festive, holiday bells and choir",
    suggestedImagePrompts: [
      "A magical Christmas tree with twinkling lights and presents underneath, cozy winter scene",
      "A snowy winter wonderland with a cozy cabin, warm lights, and falling snow",
      "Santa's sleigh flying over a moonlit snowy village on Christmas Eve",
    ],
    colorScheme: {
      primary: "#C41E3A",
      secondary: "#1B5E20",
      accent: "#FFD700",
      background: "#FFF5F5",
    },
  },
  {
    name: "Valentine's Day",
    slug: "valentines",
    icon: "❤️",
    description: "Share your love",
    defaultParticles: "hearts-sparkle",
    defaultMusicPrompt:
      "Romantic R&B love song, smooth and passionate, heartfelt and tender",
    suggestedImagePrompts: [
      "Red roses with hearts and soft romantic lighting, Valentine's Day atmosphere",
      "A romantic sunset scene with heart-shaped clouds and warm golden light",
      "Elegant love letter with red roses, chocolate hearts, and candle light",
    ],
    colorScheme: {
      primary: "#E91E63",
      secondary: "#FF5252",
      accent: "#FF80AB",
      background: "#FFF0F5",
    },
  },
  {
    name: "Condolences",
    slug: "condolences",
    icon: "🕯️",
    description: "Offer comfort and support",
    defaultParticles: "soft-light",
    defaultMusicPrompt:
      "Somber, gentle piano music, peaceful and comforting, reflective and serene",
    suggestedImagePrompts: [
      "A single white lily with soft candlelight, peaceful and serene atmosphere",
      "A peaceful sunset over calm water with soft golden light, tranquil and comforting",
      "White flowers with gentle light, a serene and respectful memorial scene",
    ],
    colorScheme: {
      primary: "#607D8B",
      secondary: "#90A4AE",
      accent: "#B0BEC5",
      background: "#F5F5F5",
    },
  },
  {
    name: "Anniversary",
    slug: "anniversary",
    icon: "🌹",
    description: "Celebrate years of love",
    defaultParticles: "rose-petals",
    defaultMusicPrompt:
      "Romantic jazz music, nostalgic and elegant, smooth saxophone and piano",
    suggestedImagePrompts: [
      "Red roses with champagne glasses and a golden anniversary number, elegant celebration",
      "A romantic dinner setting with candles, roses, and starlight",
      "Two hearts intertwined with roses and golden decorations, timeless love",
    ],
    colorScheme: {
      primary: "#8B0000",
      secondary: "#DAA520",
      accent: "#FF69B4",
      background: "#FFF5F5",
    },
  },
  {
    name: "Mother's Day",
    slug: "mothers-day",
    icon: "💐",
    description: "Celebrate the best mom",
    defaultParticles: "hearts",
    defaultMusicPrompt: "Warm, loving acoustic music, gentle and heartfelt, tender and beautiful",
    suggestedImagePrompts: [
      "A stunning bouquet of pink roses and peonies with warm soft lighting, loving atmosphere",
      "A serene garden with blooming flowers, a sun hat on a bench, peaceful Mother's Day",
      "An elegant tea setting with fine china, flowers, and warm morning light",
    ],
    colorScheme: {
      primary: "#E8A0BF",
      secondary: "#F5D0E0",
      accent: "#C9699E",
      background: "#FFF5F9",
    },
  },
  {
    name: "Father's Day",
    slug: "fathers-day",
    icon: "👔",
    description: "Honor an amazing dad",
    defaultParticles: "confetti",
    defaultMusicPrompt: "Warm, sophisticated jazz music, distinguished and heartfelt, classic and refined",
    suggestedImagePrompts: [
      "A classic gentleman's study with leather books and a pocket watch, warm refined atmosphere",
      "A scenic mountain landscape with a lake at golden hour, outdoor adventure",
      "A rustic woodworking workshop with warm lighting and quality tools",
    ],
    colorScheme: {
      primary: "#2C3E6B",
      secondary: "#4A6FA5",
      accent: "#C9A96E",
      background: "#F5F7FA",
    },
  },
  {
    name: "Graduation",
    slug: "graduation",
    icon: "🎓",
    description: "Celebrate their achievement",
    defaultParticles: "confetti",
    defaultMusicPrompt: "Triumphant orchestral music, proud and uplifting, celebratory fanfare",
    suggestedImagePrompts: [
      "Graduation cap and diploma with golden confetti, triumphant achievement celebration",
      "Caps tossed in the air against a bright blue sky, joyful graduation celebration",
      "A sunrise over an open road, bright future ahead, inspiring graduation moment",
    ],
    colorScheme: {
      primary: "#1A2744",
      secondary: "#3D5A99",
      accent: "#FFD700",
      background: "#F5F6FA",
    },
  },
  {
    name: "New Home",
    slug: "new-home",
    icon: "🏡",
    description: "Welcome to their new place",
    defaultParticles: "confetti",
    defaultMusicPrompt: "Warm, cheerful acoustic music, welcoming and homey, light and happy",
    suggestedImagePrompts: [
      "A golden house key with a ribbon in front of a beautiful home's front door",
      "A charming cottage with a flowering garden and warm glowing windows at dusk",
      "A cozy living room with a fireplace, comfortable sofa, and fresh flowers",
    ],
    colorScheme: {
      primary: "#5B8C5A",
      secondary: "#A8D5A2",
      accent: "#C9A96E",
      background: "#F5FAF5",
    },
  },
  {
    name: "New Job",
    slug: "new-job",
    icon: "💼",
    description: "Cheers to their new role",
    defaultParticles: "stars",
    defaultMusicPrompt: "Upbeat, confident pop music, energetic and motivating, fresh start vibes",
    suggestedImagePrompts: [
      "A fresh modern desk setup with a city view, coffee, and morning light",
      "A stunning city skyline at sunrise with golden light and new opportunities",
      "A celebration toast with confetti and champagne, new job congratulations",
    ],
    colorScheme: {
      primary: "#1A7A6D",
      secondary: "#7FCEC5",
      accent: "#FFD700",
      background: "#F2FAF8",
    },
  },
  {
    name: "Retirement",
    slug: "retirement",
    icon: "🌅",
    description: "Celebrate a life's work",
    defaultParticles: "gold-confetti",
    defaultMusicPrompt: "Smooth, relaxing jazz music, celebratory and mellow, warm saxophone",
    suggestedImagePrompts: [
      "A golden sunset over a calm ocean with a sailboat, peaceful retirement",
      "A beautiful garden retreat with a bench under a tree, relaxing paradise",
      "An elegant celebration with champagne and golden accents, distinguished achievement",
    ],
    colorScheme: {
      primary: "#D4760A",
      secondary: "#F5C16C",
      accent: "#8B4513",
      background: "#FFFAF0",
    },
  },
  {
    name: "Engagement",
    slug: "engagement",
    icon: "💎",
    description: "They said yes!",
    defaultParticles: "hearts-sparkle",
    defaultMusicPrompt: "Romantic, enchanting music, sparkling and joyful, love and excitement",
    suggestedImagePrompts: [
      "A sparkling diamond ring on rose petals with soft bokeh lights",
      "Beautiful roses with champagne and a diamond ring, romantic engagement",
      "A romantic sunset with two silhouettes, dreamy engagement proposal",
    ],
    colorScheme: {
      primary: "#D4A574",
      secondary: "#F5E0CC",
      accent: "#E8B4B8",
      background: "#FFF8F5",
    },
  },
  {
    name: "New Baby",
    slug: "new-baby",
    icon: "🍼",
    description: "Welcome the little one",
    defaultParticles: "bubbles",
    defaultMusicPrompt: "Gentle, sweet lullaby music, tender and loving, warm and soothing",
    suggestedImagePrompts: [
      "An adorable nursery with a crib, soft pastel colors, and a star mobile",
      "Tiny baby booties and a soft blanket with pastel flowers, warm lighting",
      "A stork delivering a baby bundle through a dreamy pastel sky",
    ],
    colorScheme: {
      primary: "#B8D4E3",
      secondary: "#F5D5E0",
      accent: "#E8E0A6",
      background: "#F8FBFF",
    },
  },
  {
    name: "Easter",
    slug: "easter",
    icon: "🐣",
    description: "Happy Easter wishes",
    defaultParticles: "butterflies",
    defaultMusicPrompt: "Light, cheerful spring music, gentle and uplifting, pastoral and bright",
    suggestedImagePrompts: [
      "Decorated Easter eggs in a basket with spring flowers, pastel colors",
      "A cute Easter bunny in a blooming spring garden with colorful eggs",
      "Beautiful spring flowers blooming with cherry blossoms and butterflies",
    ],
    colorScheme: {
      primary: "#9ED2BE",
      secondary: "#F5C6D0",
      accent: "#E8D35A",
      background: "#F8FFF5",
    },
  },
  {
    name: "New Year",
    slug: "new-year",
    icon: "🎆",
    description: "Ring in the new year",
    defaultParticles: "gold-confetti",
    defaultMusicPrompt: "Energetic, celebratory dance music, exciting countdown vibes, festive",
    suggestedImagePrompts: [
      "Spectacular midnight fireworks over a city skyline, colorful celebration",
      "An elegant champagne toast at midnight with sparklers and golden bubbles",
      "A vintage golden clock approaching midnight with confetti and decorations",
    ],
    colorScheme: {
      primary: "#1A1A3E",
      secondary: "#3D3D7A",
      accent: "#FFD700",
      background: "#F5F5FF",
    },
  },
  {
    name: "Halloween",
    slug: "halloween",
    icon: "🎃",
    description: "Spooky season greetings",
    defaultParticles: "confetti",
    defaultMusicPrompt: "Playfully spooky music, mysterious and fun, quirky Halloween vibes",
    suggestedImagePrompts: [
      "Glowing jack-o-lanterns on a porch with autumn leaves and candlelight",
      "A spooky haunted mansion under a full moon with bats and fog",
      "Fun Halloween trick-or-treat scene with candy and autumn decorations",
    ],
    colorScheme: {
      primary: "#E85D04",
      secondary: "#6A0572",
      accent: "#FFD700",
      background: "#FFF5EB",
    },
  },
  {
    name: "Thanksgiving",
    slug: "thanksgiving",
    icon: "🍂",
    description: "Give thanks and gratitude",
    defaultParticles: "soft-light",
    defaultMusicPrompt: "Warm, grateful folk music, cozy and heartfelt, acoustic and wholesome",
    suggestedImagePrompts: [
      "A Thanksgiving feast table with autumn decorations, pumpkins, and candles",
      "An autumn harvest cornucopia with fruits, vegetables, and golden wheat",
      "A rustic pumpkin patch with fall leaves and warm golden sunset light",
    ],
    colorScheme: {
      primary: "#B85C2F",
      secondary: "#DBA15A",
      accent: "#8B4513",
      background: "#FFF8F0",
    },
  },
  {
    name: "Thinking of You",
    slug: "thinking-of-you",
    icon: "💭",
    description: "Let them know you care",
    defaultParticles: "soft-light",
    defaultMusicPrompt: "Gentle, reflective piano music, calming and thoughtful, warm and caring",
    suggestedImagePrompts: [
      "Soft wildflowers in a gentle meadow with warm sunlight and butterflies",
      "A cozy window scene with tea, rain falling outside, and fresh flowers",
      "A peaceful starlit sky with soft moonlight and a gentle meadow",
    ],
    colorScheme: {
      primary: "#9B8EC4",
      secondary: "#D4CEE8",
      accent: "#B8A0D6",
      background: "#F8F5FF",
    },
  },
  {
    name: "Good Luck",
    slug: "good-luck",
    icon: "🍀",
    description: "Wish them the best",
    defaultParticles: "stars",
    defaultMusicPrompt: "Uplifting, hopeful music, encouraging and bright, confident and warm",
    suggestedImagePrompts: [
      "A four-leaf clover with golden sparkles and dewy morning light",
      "A hopeful sunrise over a beautiful landscape with golden light",
      "Shooting stars across a twilight sky with magical sparkles",
    ],
    colorScheme: {
      primary: "#2D8B46",
      secondary: "#A8D5A2",
      accent: "#FFD700",
      background: "#F2FAF5",
    },
  },
  {
    name: "Missing You",
    slug: "miss-you",
    icon: "🌙",
    description: "Bridge the distance",
    defaultParticles: "soft-light",
    defaultMusicPrompt: "Tender, nostalgic music, gentle and emotional, longing piano melody",
    suggestedImagePrompts: [
      "A full moon over calm water with soft reflections and gentle twilight",
      "A handwritten letter with pressed flowers and warm candlelight",
      "A warm sunset over a distant horizon with gentle clouds",
    ],
    colorScheme: {
      primary: "#4A5D8E",
      secondary: "#8B9DC3",
      accent: "#C9A96E",
      background: "#F5F7FF",
    },
  },
  {
    name: "Sorry",
    slug: "sorry",
    icon: "🕊️",
    description: "Make things right",
    defaultParticles: "soft-light",
    defaultMusicPrompt: "Gentle, sincere piano music, reflective and tender, peaceful and hopeful",
    suggestedImagePrompts: [
      "A white dove carrying an olive branch with soft muted tones and flowers",
      "A rainbow after rain with fresh raindrops on flowers and clearing sky",
      "A gentle bouquet of soft pink and white flowers with a heartfelt note",
    ],
    colorScheme: {
      primary: "#7E9AA7",
      secondary: "#B8CDD6",
      accent: "#A8B8A0",
      background: "#F5F8FA",
    },
  },
  {
    name: "Custom Occasion",
    slug: "custom",
    icon: "✨",
    description: "Create your own occasion",
    defaultParticles: "confetti",
    defaultMusicPrompt: "Warm, versatile celebratory music, heartfelt and beautiful, elegant",
    suggestedImagePrompts: [
      "An elegant floral arrangement with warm golden lighting, premium celebration",
      "A whimsical scene with colorful confetti, balloons, and sparkles",
      "A beautiful natural landscape with soft golden light and wildflowers",
    ],
    colorScheme: {
      primary: "#C9A96E",
      secondary: "#E8DCC8",
      accent: "#B8956A",
      background: "#FDFBF7",
    },
  },
];

// ─── Occasion Categories (for grouped display on landing page) ────────
export interface OccasionCategory {
  label: string;
  slugs: OccasionKey[];
}

export const OCCASION_CATEGORIES: OccasionCategory[] = [
  {
    label: "Celebrations",
    slugs: ["birthday", "congratulations", "graduation", "engagement", "wedding", "anniversary"],
  },
  {
    label: "Family & New Beginnings",
    slugs: ["mothers-day", "fathers-day", "baby-shower", "new-baby", "new-home", "new-job", "retirement"],
  },
  {
    label: "Holidays",
    slugs: ["christmas", "valentines", "easter", "new-year", "halloween", "thanksgiving"],
  },
  {
    label: "Heartfelt",
    slugs: ["thank-you", "get-well", "thinking-of-you", "good-luck", "miss-you", "sorry", "condolences"],
  },
];
