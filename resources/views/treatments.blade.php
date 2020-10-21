@extends('layouts.site')

@push('metadata')
<title>Treatments | Body Wizard</title>
<meta name='description' content="The Four Pillars of Treatment">
<meta property='og:url' content="https://bodywizardmedicine.com/treatments">
<meta property='og:title' content="Treatments | Body Wizard">
<meta property='og:description' content="The Four Pillars of Treatment">
@endpush

@section('content')
        <div class='splash btnPopDown top' id='head-1'>
            <h1 class='purple paddedXSmall shaded30'>Treatments Offered</h1>
            <div class='button small booknow pink'>book an appointment</div>
        </div>
        <h2 class='yellow paddedSmall'>The Four Pillars of Treatment</h2>
        <div class='menuBar website' id='TreatmentMenu' data-populated='no' data-target='window' data-mode='scroll'>
            <div class='tab' id='acu'><div class='title'>Acupuncture</div></div>
            <div class='tab' id='botanical'><div class='title'>Botanical Medicine</div></div>
            <div class='tab' id='fascial'><div class='title'>Fascial Release</div></div>
            <div class='tab' id='meditation'><div class='title'>Guided Meditation + Breathing</div></div>
        </div>
        
        <div id='Treatments' class='central large left listings'>
            <div id='AcuListing' class='service'>
                <div class='splash'>
                    <div class='icon acu pink'></div>
                    <h3 class='white'>Acupuncture</h3>
                </div>
                <p>Acupuncture utilizes the network of channels that distribute nutrients and information throughout the body. Like rivers connecting bodies of water, the channels connect organs with each other and the rest of the body. It is through the channels that the organs are able to interact with the world around us.</p>
                <p>By stimulating the channels, signals are sent inward to the organs and the brain. This is how acupuncture improves organ functions and regulates hormones.</p>
                <p>By clearing blockages in a channel, the flow of information and nutrients is restored which relieves pain throughout that channel and the channels connected to it.</p>
                <p>At the site of each needle insertion, there is a biochemical cascade that relieves inflammation, attracts immune cells to clean up debris, and triggers nerve cells to send signals upstream to the spinal cord and brain.</p>
                <p>These are some of the effects that explain how acupuncture is beneficial from the lens of modern science. Research is continuously being done that shows acupuncture in a new light and elucidates new mechanisms by which it acts.</p>
                <div class='rate'>
                    <span class='bold'>Acupuncture Rate</span> <span class='italic smallFont'>(1 hr session)</span><span class='price pink bold'>$80</span>
                </div>
            </div>
            <div id='BotanicalListing' class='service'>
                <div class='splash'>
                    <div class='icon botanical pink'></div>
                    <h3 class='white'>Botanical Medicine</h3>
                </div>
                <p>The tradition of using botanical substances in Chinese medicine has a documented history of more than 2000 years. However, its long history by itself does not mean that it works.</p>
                <p>There is modern research on many of these botanicals and the compounds they contain, including basic research to determine how they work as well as clinical trials to test their effectiveness.</p>
                <p>In many cases, research confirms the traditional usage of botanicals and, sometimes, shows that there are additional effects that were previously unknown. Occasionally, a botanical is studied and determined to be ineffective. When that happens, it inform our treatments as well.</p>
                <p>Combining this wealth of research information with the traditional usage of over 400 botanical substances, we prescribe only formulas that we are confident will be safe and effective for every patient.</p>
                <div class='rate'>
                    <span class='bold'>Botanical Consultation Rate</span> <span class='italic smallFont'>(30 minute session)</span><span class='price pink bold'>$45</span>
                </div>
            </div>
            <div id='FascialListing' class='service'>
                <div class='splash'>
                    <div class='icon fascial pink'></div>
                    <h3 class='white'>Fascial Release</h3>
                </div>
                <p>Fascia is the biological plastic wrap that encases every muscle, bone, blood vessel, organ, and nerve. It forms long, continuous stretches of "bio-wrap" that extend from the inner organs all the way to the tips of the fingers and toes.</p>
                <p>Every structure in the body is wrapped by fascia. When properly hydrated and free of obstructions, fascia slides easily in both directions and allows for easy gliding movements.</p>
                <p>Sometimes friction or adhesions to surrounding structures limit the sliding movement of the fascia. This is one factor that can cause stiffness and pain, and it's the reason fascial release can help.</p>
                <p>Cupping is using glass or plastic cups to create suction on the body. The negative pressure pulls and stretches the soft tissue and its fascia. Sliding the cups while they’re on the body can enhance this effect.</p>
                <p>Scraping, also called gua sha, is the use of a small handheld tool to stretch and loosen the fascia. This helps break up adhesions in the fascia and massages the soft tissue underneath.</p>
                <p>Where there is pain, there is reduced circulation, which we call “stagnation”. Fascial release techniques help to bring new circulation to these areas. Stagnant metabolic wastes are brought back into the blood where they can be eliminated, and the area is opened up for immune cells that break down and repair connective tissue.</p>
                <div class='rate'>
                    <span class='bold'>Fascial Release Rate</span> <span class='italic smallFont'>(30 minute session)</span><span class='price pink bold'>$45</span>
                </div>
            </div>
            <div id='MeditationListing' class='service'>
                <div class='splash'>
                    <div class='icon meditation pink'></div>
                    <h3 class='white'>Guided Meditation + Breathing</h3>
                </div>
                <p>Sometimes we know a particular pattern of behavior is detrimental to our health, yet we have trouble changing it. There are practices that can help, but it can be difficult to get the ball rolling.</p>
                <p>One of the most common meditations used here is a simple guided scan of the body. This practice gets you out of your head and into your body, which may help short circuit familiar patterns of thought.</p>
                <p>We discuss cycles of personal transformation based on the five elements of Chinese medicine and the seven chakras of Ayurvedic medicine. This informs our strategy as to which parts of the cycles are blocked and which need to be strengthened.</p>
                <p>By learning and repeating these practices in a guided fashion in a safe space, it becomes much easier to call upon them when you are stressed, feeling stuck, or feeling a lack of motivation.</p>
                <div class='rate'>
                    <span class='bold'>Guided Meditation Rate</span> <span class='italic smallFont'>(20 minute session)</span><span class='price pink bold'>$25</span>
                </div>
            </div>
        </div>
        <div id='CondDesc' class='small paddedXBig yellowBg10'>
            <div class='wrapper'>
                <div class='icon stomach pink'></div>
                <div class='divide hor yellowBg central xs'></div>
                <h4 class='paddedSmall'>Internal Medicine</h4>
            </div>
            <div class='wrapper'>
                <div class='icon knee pink'></div>
                <div class='divide hor yellowBg central xs'></div>
                <h4 class='paddedSmall'>Muscle + Joint Pain</h4>
            </div>
            <div class='wrapper'>
                <div class='icon brain pink'></div>
                <div class='divide hor yellowBg central xs'></div>
                <h4 class='paddedSmall'>Psychosocial Conditions</h4>
            </div>
            <br>
            <div class='button fullWidth small pink marginBig bottomOnly link' data-target='/conditions'>more about what we treat</div>
        </div>

@endsection