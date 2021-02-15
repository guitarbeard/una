export const TimerPlugin = (timerSetup) => ({
    name: 'timer',
    api: () => {
        const timerObj = timerSetup();

        const start = () => {
            console.log('START');
            return timerObj.getPlayerTimer().start();
        };
        const reset = () => {
            return timerObj.getPlayerTimer().reset();
        };
        const get = () => {
            // console.log('GET', timerObj.getTime());
            return timerObj.getTime();
        };

        return { start, reset, get };
    }
});