const cometDomain = process.env.NEXT_PUBLIC_COMET_APP_DOMAIN;

const useCometAppUrl = () => {
    return cometDomain;
};

export default useCometAppUrl;
