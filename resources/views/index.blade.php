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
                <h1 class='nowrap'>Integrative Medicine Studio</h1>
                <h4 class='paddedSides caps letterStretch'>Chinese Medicine with a Foundation in Biochemistry</h4>
            </div>
            
            <div class='button booknow small pink'>book an appointment</div>
        </div>

        <h1 class='purple central paddedBig letterStretch'>Bringing Scientific Rigor to the Practice of Chinese Medicine</h1>
        <div id='CondDesc'>
            <div class='wrapper'>
                <div class='icon stomach pink'></div>
                <div class='divide hor yellowBG central small'></div>
                <h3 class='paddedSmall'>Internal Medicine</h3>
                <p class='central small'>Most commonly treated are<br>Hormone Balance, Digestive Issues,<br>Fatigue, and Insomnia</p>
            </div>
            <div class='wrapper'>
                <div class='icon knee pink'></div>
                <div class='divide hor yellowBG central small'></div>
                <h3 class='paddedSmall'>Muscle + Joint Pain</h3>
                <p class='central small'>Whether it's due to injury, posture,<br>or degeneration, we can help you<br>go longer without pain</p>
            </div>
            <div class='wrapper'>
                <div class='icon brain pink'></div>
                <div class='divide hor yellowBG central small'></div>
                <h3 class='paddedSmall'>Psychosocial Conditions</h3>
                <p class='central small'>Anxiety and Depression,<br>Feeling Stuck, Feeling Disconnected,<br>Spiritual Concerns</p>
            </div>
        </div>
        <div id='ServiceDesc' class='split50'>
            <div id='bp-1' class='splash'></div>
            <div class='left paddedBig paddedSides'>
                <h3 class='yellow'>Services Provided</h3>
                <h4>Acupuncture</h4>
                <p>Hair-thin needles used to stimulate the body, releasing a veritable stew of anti-inflammatory and feel-good chemicals that cascade inward to the organs and the brain</p>
                <h4>Botanical Medicine</h4>
                <p>Botanical substances prescribed with a blended sense of scientific rigor and traditional wisdom that assures you are getting the absolute best medicinals</p>
                <h4>Fascial Release</h4>
                <p>Fascial release techniques, such as cupping and scraping, release stored metabolic wastes and stimulate the healing process for soft tissues</p>
                <h4>Guided Meditation</h4>
                <p>Methods to get you out of your head, foster body awareness, reawaken dormant aspects of the psyche, and explore ways to move forward in life</p>
                <a href='/treatments'><h4 class='pink'>READ MORE AND SEE RATES ></h4></a>
            </div>
        </div>
        <div class='quoteBlock'>
            <div class='bar purpleBG'></div>
            <div id='crystals' class='splash'></div>
            <div class='quote central btnPopDown'>
                <div class='logo popUp'></div>
                <div class='quoteText purple'>I am a very active person, and was having persistent back pain that I couldn't seem to kick. I tried physical therapy, massage, muscle relaxers... and finally came to David. Within two sessions, my back pain was a thing of the past and I was back to full speed in the gym.</div>
                <h4 class='yellow caps paddedSmall'>Nathan M.</h4>
                <a href='/conditions'><div class='button small pink'>learn more</div></a>
            </div>
        </div>
@endsection

