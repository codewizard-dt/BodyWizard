@extends("layouts.site")

@push('metadata')
    <title>Body Wizard Integrative Medicine</title>
    <meta name='description' content="Bringing Scientific Rigor to the Practice of Chinese Medicine">
    <meta property='og:url' content="https://bodywizardmedicine.com">
    <meta property='og:title' content="Body Wizard Integrative Medicine">
    <meta property='og:description' content="Bringing Scientific Rigor to the Practice of Chinese Medicine">
@endpush

@section('content')
    <div id='acu_chin_1' class='splash'>
        <div class="center shaded30 p-huge-y">
            <div class='logo notext_color center_logo'></div>
            <h1 class='purple'>Body Wizard Medicine</h1>
            <h4 class='purple caps letterStretch'>Chinese Medicine with a Foundation in Biochemistry</h4>
        </div>
        <div class='button booknow pink pop-up-half'>book an appointment</div>
    </div>

    <div id='Conditions' class="segment">
        <h1 class='purple central p-y-150 letterStretch'>So Effective It Feels Like Magic</h1>
        <div class='flexbox thirds top'>
            <div class='center m-none-top m-small'>
                <div class='icon internal pink'></div>
                <div class='divider yellow'></div>
                <h3 class='p-xsmall-y'>Internal Medicine</h3>
                <div class='center list'>
                    <div class="item">Digestive Issues</div>
                    <div class="item">Hormonal + Reproductive Issues</div>
                    <div class="item">Fatigue + Insomnia</div>
                </div>
            </div>
            <div class='center m-none-top m-small'>
                <div class='icon joint pink'></div>
                <div class='divider yellow '></div>
                <h3 class='p-xsmall-y'>Aches + Pains</h3>
                <div class='center list'>
                    <div class="item">Back pain + Sciatica</div>
                    <div class="item">Shoulder + Neck Pain</div>
                    <div class="item">Headaches + Migraines</div>
                </div>
            </div>
            <div class='center m-none-top m-small'>
                <div class='icon psych pink'></div>
                <div class='divider yellow '></div>
                <h3 class='p-xsmall-y'>Psychosocial</h3>
                <div class='center list'>
                    <div class="item">Anxiety + Depression</div>
                    <div class="item">Stress Related Disorders</div>
                    <div class="item">Integrating Mind + Body</div>
                </div>
            </div>
        </div>
    </div>

    <div id='Services' class='flexbox top segment'>
        <div id='bp_1' class='splash basis-40 grow-1'></div>
        <div class='left list p-small basis-60 grow-1'>
            <h3 class='yellow'>Services Provided</h3>
            <div class="item">
                <h4 class='purple'>Acupuncture</h4>
                <p>Hair-thin needles used to stimulate the body, releasing anti-inflammatory and feel-good chemicals that
                    cascade inward to the organs and the brain</p>
            </div>
            <div class="item">
                <h4 class='purple'>Botanical Medicine</h4>
                <p>Botanical substances prescribed with scientific rigor and traditional wisdom, ensuring you get an
                    effective, 100% personalized formula</p>
            </div>
            <div class="item">
                <h4 class='purple'>Fascial Release</h4>
                <p>Fascial release techniques, such as cupping and scraping, release stored metabolic wastes and stimulate
                    the healing process for soft tissues</p>
            </div>
            <div class="item">
                <h4 class='purple'>Guided Meditation</h4>
                <p>Methods to get you out of your head, connect with your body, and reawaken dormant aspects of yourself</p>
            </div>
            <a href='/treatments' class="pink">
                <h4>READ MORE AND SEE RATES ></h4>
            </a>
        </div>
    </div>


    <div class='segment indented centered w-max-large rounded-medium'>
        <div class='band purple large'></div>
        <div id='crystals' class='splash fit-content'>
            <div class='center'>
                <div class='logo notext_white pop-up-large m-small-bottom-neg'></div>
                <div class='quote purple white-bg-light-o p-large text-double'>
                    <div class="text">
                        Within two sessions, my back pain was a thing of the past and I was back to full speed in the gym.
                    </div>
                    <div class='author yellow'>Nathan</div>
                </div>
                <a href='/conditions' class='button pink pop-up-half'>
                    learn more
                </a>
            </div>
        </div>
    </div>
@endsection
