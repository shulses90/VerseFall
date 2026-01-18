export const translations = {
  en: {
    headerSubtitle: 'War of the Absolutes',
    beginTransmission: 'Begin Transmission',
    factionChoiceSubtext: 'Your command will echo across eternity.',
    queryingCogitators: 'Analyzing Timestreams...',
    transmissionError: '++ Datastream Corruption ++',
    restartVoxLink: 'Re-establish Connection',
    selectYourChapter: 'Choose Your Faction',
    yourChoiceDictates: 'Your choice dictates the fate of your faction.',
    selectChapter: 'Lead this Faction',
    restartChronicle: 'Start New Chronicle',
    codex: 'Codex',
    errorContinue: 'The story could not continue. The threads of fate are tangled.',
    endings: {
        tyrannical: { title: 'The Tyrannical Ending' },
        stagnation: { title: 'The Stagnation Ending' },
        awakening: { title: 'The Awakening Ending' },
    },
    factions: {
      aethelgard: { name: 'Aethelgard Compact', description: 'A hyper-capitalist republic valuing profit and technological supremacy. Their military relies on advanced drones, mechs, and precise orbital strikes.' },
      veridian: { name: 'Veridian Sovereignties', description: 'A coalition of ancient peoples defending the natural cycle of life and death. They command magically-enhanced warriors and giant summoned beasts.' },
      chronomach: { name: 'Chronomach Guilds', description: 'A cyber-punk society obsessed with transhumanism and individual freedom. They excel in asymmetric warfare: assassins, info-wars, and lightning raids.' },
      celestial: { name: 'Celestial Purity', description: 'A monolithic theocracy fueled by unwavering faith. They might see the enemy\'s perfect order as a divine calling, making them a dangerous wildcard.' },
      weavers: { name: 'Ancient Weavers', description: 'Cultures wielding esoteric powers who understand the cosmic balance. They use reality-bending spells and summon ancestral spirits.' },
      pantheon: { name: 'Pantheon Ascendant', description: 'Heroic societies led by demigods and legendary champions. Their warfare centers on epic individuals whose glorious deeds can turn the tide of battle.' },
    }
  },
  fr: {
    headerSubtitle: 'La Guerre des Absolus',
    beginTransmission: 'Commencer la Transmission',
    factionChoiceSubtext: 'Votre commandement résonnera à travers l\'éternité.',
    queryingCogitators: 'Analyse des Lignes Temporelles...',
    transmissionError: '++ Corruption du Flux de Données ++',
    restartVoxLink: 'Rétablir la Connexion',
    selectYourChapter: 'Choisissez Votre Faction',
    yourChoiceDictates: 'Votre choix dicte le destin de votre faction.',
    selectChapter: 'Mener cette Faction',
    restartChronicle: 'Nouvelle Chronique',
    codex: 'Codex',
    errorContinue: 'L\'histoire ne peut continuer. Les fils du destin sont emmêlés.',
    endings: {
        tyrannical: { title: 'La Fin Tyrannique' },
        stagnation: { title: 'La Fin de la Stagnation' },
        awakening: { title: 'La Fin de l\'Éveil' },
    },
    factions: {
      aethelgard: { name: 'Pacte Aethelgard', description: 'Une république hyper-capitaliste valorisant le profit et la suprématie technologique. Leur armée repose sur des drones, des mechs et des frappes orbitales.' },
      veridian: { name: 'Souverainetés Veridian', description: 'Une coalition de peuples anciens défendant le cycle naturel de la vie et de la mort. Ils commandent des guerriers et des bêtes invoquées géantes.' },
      chronomach: { name: 'Guildes Chronomach', description: 'Une société cyberpunk obsédée par le transhumanisme et la liberté. Ils excellent en guerre asymétrique : assassins, info-guerres et raids éclairs.' },
      celestial: { name: 'Pureté Céleste', description: 'Une théocratie monolithique animée par une foi inébranlable. Ils pourraient voir l\'ordre parfait de l\'ennemi comme un appel divin, un dangereux joker.' },
      weavers: { name: 'Tisserands Anciens', description: 'Des cultures maniant des pouvoirs ésotériques qui comprennent l\'équilibre cosmique. Ils utilisent des sorts de réalité et invoquent des esprits ancestraux.' },
      pantheon: { name: 'Panthéon Ascendant', description: 'Des sociétés héroïques menées par des demi-dieux et des champions légendaires. Leur art de la guerre est centré sur des individus épiques.' },
    }
  }
};

export type Language = keyof typeof translations;