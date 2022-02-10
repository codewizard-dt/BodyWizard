@extends('layouts.site')

@push('metadata')
    <title>Appointments + Rates | Body Wizard</title>
    <meta name='description'
        content="Appointments are categorized as Evaluation + Diagnosis, Acupuncture, Botanical Medicine, Fascial Release, and Guided Meditation + Breathing">
    <meta property='og:url' content="https://bodywizardmedicine.com/treatments">
    <meta property='og:title' content="Appointments + Rates | Body Wizard">
    <meta property='og:description'
        content="Appointments are categorized as Evaluation + Diagnosis, Acupuncture, Botanical Medicine, Fascial Release, and Guided Meditation + Breathing">
@endpush

@section('content')
    <div class='splash' id='shelf_1'>
        <h1 class='p-y-mini shaded30 purple'>Appointments and Rates</h1>
    </div>
    <div class='menuBar website' id='RateMenu' data-populated='no' data-target='window' data-mode='scroll'>
        <div class='tab' id='eval'>
            <div class='title'>Evaluation + Diagnosis</div>
        </div>
        <div class='tab' id='acu'>
            <div class='title'>Acupuncture</div>
        </div>
        <div class='tab' id='botanical'>
            <div class='title'>Botanical Medicine</div>
        </div>
        <div class='tab' id='fascial'>
            <div class='title'>Fascial Release</div>
        </div>
        <div class='tab' id='meditation'>
            <div class='title'>Guided Meditaiton + Breathing</div>
        </div>
    </div>
    <div class='central fit-content p-y-medium' id='Rates'>
        <div class='split40' id='EvaluationRates'>
            <div class='splash'></div>
            <div class='left paddedSides leftOnly'>
                <div class="divider yellow"></div>
                <h4 class='p-y-xsmall'>Evaluation + Diagnosis <span class='little italic'>(not for treatment)</span></h4>
                <p><span class='price pink bold'>$120</span><span class='underlined'>New Patient Appointment (90
                        minute)</span> - initial appointment required for ALL new patients. A full medical exam is
                    performed, including complete review of systems and, if necessary, musculoskeletal exam or psychosocial
                    review. This appointment is for diagnosis and creating a treatment plan only.</p>
                <p><span class='price pink bold'>$90</span><span class='underlined'>Case Review (60 minute)</span> - for
                    reevaluation of existing patients including full exam and review of symptoms. During the course of
                    treatment, this appointment is necessary about every 3 months. This appointment is for diagnosis and
                    revising a treatment plan only.</p>
            </div>
        </div>
        <div class='split40' id='AcuRates'>
            <div class='splash'></div>
            <div class='left paddedSides leftOnly'>
                <div class="divider yellow"></div>
                <h4 class='p-y-xsmall'>Acupuncture Treatment</h4>
                <p><span class='price pink bold'>$80</span><span class='underlined'>Standard Acupuncture (60 minute)</span>
                    - for regularly scheduled care related to internal medicine, muscle and joint pain, and psychosocial
                    conditions</p>
                <p><span class='price pink bold'>$45</span><span class='underlined'>Limited Acupuncture (30 minute)</span> -
                    for specific cases of muscle and joint pain that only require a shorter office visit</p>
                <p><span class='price pink bold'>$115</span><span class='underlined'>Extended Acupuncture (90 minute)</span>
                    - recommended for specific cases of psychosocial conditions that benefit from longer treatment times</p>
            </div>
        </div>
        <div class='split40' id='BotanicalRates'>
            <div class='splash'></div>
            <div class='left paddedSides leftOnly'>
                <div class="divider yellow"></div>
                <h4 class='p-y-xsmall'>Botanical Medicine</h4>
                <p><span class='price pink bold'>$45</span><span class='underlined'>Botanical Consultation (30
                        minute)</span> - for reevaluation of a botanical medicine after the initial New Patient Appointment
                </p>
                <p><span class='price pink bold'>$28</span><span class='underlined'>Botanical Tincture (4 oz)</span> -
                    customized medicinal botanical extract, approx. 2 week supply, price may vary</p>
                <p><span class='price pink bold'>$24</span><span class='underlined'>Patent Medicine (100 capsules)</span> -
                    botanicals encapsulated in pill form, approx. 2 week supply, not customized</p>
                <p><span class='price pink bold'>varies</span><span class='underlined'>Powdered Medicine (varies)</span> -
                    customized medicinal powder, mix with warm water to take</p>
                <p><span class='price pink bold'>$25</span><span class='underlined'>Evil Bone Water (3.5 oz)</span> - our
                    favorite topical for muscle and joint pain, including chronic pain and recent injuries</p>
            </div>
        </div>
        <div class='split40' id='FascialRates'>
            <div class='splash'></div>
            <div class='left paddedSides leftOnly'>
                <div class="divider yellow"></div>
                <h4 class='p-y-xsmall'>Fasical Release</h4>
                <p><span class='price pink bold'>$45</span><span class='underlined'>Fascial Release Only (30 minute)</span>
                    - stand-alone appointment that generally includes scraping, cupping, and application of topical
                    medicines</p>
                <p><span class='price pink bold'>$25</span><span class='underlined'>Add-On to Acupuncture (+15
                        minutes)</span> - extension of any acupuncture session that may include scraping, cupping and/or
                    application of topical medicines</p>
            </div>
        </div>
        <div class='split40' id='MeditationRates'>
            <div class='splash'></div>
            <div class='left paddedSides leftOnly'>
                <div class="divider yellow"></div>
                <h4 class='p-y-xsmall'>Guided Meditation + Breathing</h4>
                <p><span class='price pink bold'>$25</span><span class='underlined'>Meditation + Breathing Only (30
                        minute)</span> - stand-alone appointment that is a full guided experience, may include breathing
                    exercises, visualizations, and/or internal (self-directed) energy work</p>
                <p><span class='price pink bold'>$10</span><span class='underlined'>Add-On to Acupuncture (+0
                        minutes)</span> - a full guided experience layered on top of Standard or Extended Acupuncture
                    treatments, may include breathing exercises, visualizations, and/or internal (self-directed) energy work
                </p>
            </div>
        </div>
    </div>

@endsection
