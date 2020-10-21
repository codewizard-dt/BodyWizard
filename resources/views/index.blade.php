@extends("layouts.site")

@push('metadata')
<title>Body Wizard Integrative Medicine</title>
<meta name='description' content="Bringing Scientific Rigor to the Practice of Chinese Medicine">
<meta property='og:url' content="https://bodywizardmedicine.com">
<meta property='og:title' content="Body Wizard Integrative Medicine">
<meta property='og:description' content="Bringing Scientific Rigor to the Practice of Chinese Medicine">
@endpush

@section('content')
        <div id='acu-chin-1' class='splash btnPopDown'>
            <?php 
            if (isset(getallheaders()["Referer"])){
                $referer = getallheaders()["Referer"];
                if (strpos($referer,"logout")>-1){
                    echo "<div id ='LoggedOut' class='confirm'>Successfully Logged Out</div>";
                }
            }
                
            ?>
            <div class="wrapper shaded30 paddedBig">
                <div class='logo'></div>
                <h1 class='nowrap'>Body Wizard Medicine</h1>
                <h4 class='paddedSides caps letterStretch'>Chinese Medicine with a Foundation in Biochemistry</h4>
            </div>
            
            <div class='button booknow small pink'>book an appointment</div>
        </div>

        <h1 class='purple central paddedBig letterStretch'>Effective as Magic Should Be</h1>
        <div id='CondDesc'>
            <div class='wrapper'>
                <div class='icon stomach pink'></div>
                <div class='divide hor yellowBg central small'></div>
                <h3 class='paddedSmall'>Internal Medicine</h3>
                <p class='central small'>Digestive Issues<br>Hormonal + Reproductive Issues<br>Fatigue + Insomnia</p>
            </div>
            <div class='wrapper'>
                <div class='icon knee pink'></div>
                <div class='divide hor yellowBg central small'></div>
                <h3 class='paddedSmall'>Muscle, Joint + Nerve Pain</h3>
                <p class='central small'>Back pain + Sciatica<br>Shoulder + Neck Pain<br>Headaches + Migraines</p>
            </div>
            <div class='wrapper'>
                <div class='icon brain pink'></div>
                <div class='divide hor yellowBg central small'></div>
                <h3 class='paddedSmall'>Psychosocial</h3>
                <p class='central small'>Anxiety + Depression<br>Stress Related Disorders<br>Integrating Mind + Body</p>
            </div>
        </div>
        <div id='ServiceDesc' class='split50'>
            <div id='bp-1' class='splash'></div>
            <div class='left paddedBig paddedSides'>
                <h3 class='yellow'>Services Provided</h3>
                <h4>Acupuncture</h4>
                <p>Hair-thin needles used to stimulate the body, releasing anti-inflammatory and feel-good chemicals that cascade inward to the organs and the brain</p>
                <h4>Botanical Medicine</h4>
                <p>Botanical substances prescribed with scientific rigor and traditional wisdom, ensuring you get an effective, 100% personalized formula</p>
                <h4>Fascial Release</h4>
                <p>Fascial release techniques, such as cupping and scraping, release stored metabolic wastes and stimulate the healing process for soft tissues</p>
                <h4>Guided Meditation</h4>
                <p>Methods to get you out of your head, connect with your body, and reawaken dormant aspects of yourself</p>
                <a href='/treatments'><h4 class='pink'>READ MORE AND SEE RATES ></h4></a>
            </div>
        </div>
        <div class='quoteBlock'>
            <div class='bar purpleBg'></div>
            <div id='crystals' class='splash'></div>
            <div class='quote central btnPopDown'>
                <div class='logo popUp'></div>
                <div class='quoteText purple'>Within two sessions, my back pain was a thing of the past and I was back to full speed in the gym.</div>
                <h4 class='yellow caps paddedSmall'>Nathan</h4>
                <a href='/conditions'><div class='button small pink'>learn more</div></a>
            </div>
        </div>
@endsection

