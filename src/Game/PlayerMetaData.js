export const PlayerMetaData = {
    // Required.
    name: 'PlayerMetaData',
  
    // Create an object that becomes available in `ctx`
    // under `ctx['plugin-name']`.
    // This is called at the beginning of a move or event.
    // This object will be held in memory until flush (below)
    // is called.
    api: ({ G, ctx, game, data, playerID }) => {
    
    }
};