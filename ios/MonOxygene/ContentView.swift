import SwiftUI
import UIKit

private enum AppScreen { case intro, settings, session }

private struct SessionConfig: Equatable {
    var durationMinutes: Int = 5
    var inhaleSeconds: Int = 5
    var exhaleSeconds: Int = 5
    var startWithInhale: Bool = true
}

struct RootView: View {
    @State private var screen: AppScreen = .intro
    @State private var introPage = 0
    @State private var config = SessionConfig()

    var body: some View {
        ZStack {
            switch screen {
            case .intro:
                IntroView(page: $introPage) { screen = .settings }
            case .settings:
                SettingsView(config: $config) { screen = .session }
            case .session:
                BreathingSessionView(config: config) { screen = .settings }
                    .id(config)
            }
        }
        .ignoresSafeArea()
    }
}

private struct BrandMark: View {
    var light = false
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("Mon Oxygène")
                .font(.system(size: 25, weight: .semibold, design: .serif))
                .foregroundStyle(light ? .white : Color(red: 0.13, green: 0.31, blue: 0.39))
            Text("Prendre soin de son Hêtre")
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle((light ? Color.white : Color(red: 0.18, green: 0.39, blue: 0.45)).opacity(0.85))
        }
    }
}

private struct BackgroundPhoto: View {
    let filename: String
    var veil: Double = 0
    var body: some View {
        GeometryReader { geo in
            ZStack {
                if let img = bundleImage(filename) {
                    Image(uiImage: img)
                        .resizable()
                        .scaledToFill()
                        .frame(width: geo.size.width, height: geo.size.height)
                        .clipped()
                } else {
                    LinearGradient(colors: [Color(red: 0.72, green: 0.89, blue: 0.91), Color(red: 0.72, green: 0.73, blue: 0.90)], startPoint: .topLeading, endPoint: .bottomTrailing)
                }
                if veil > 0 { Color.white.opacity(veil) }
            }
        }
    }
}

private func bundleImage(_ filename: String) -> UIImage? {
    guard let path = Bundle.main.path(forResource: filename, ofType: nil) else { return nil }
    return UIImage(contentsOfFile: path)
}

private struct IntroView: View {
    @Binding var page: Int
    let onDone: () -> Void

    private let kickers = [
        "RESPIRER EN CONSCIENCE",
        "RETROUVER SA MARGE DE CHOIX",
        "CRÉER UN ESPACE INTÉRIEUR",
        "LAISSER LE SOUFFLE CIRCULER",
        "ÉCOUTER SON BESOIN DU MOMENT",
        "D’UN OUTIL VERS UNE RESSOURCE"
    ]

    var body: some View {
        GeometryReader { geo in
            ZStack {
                BackgroundPhoto(filename: "settings_bg.jpg", veil: 0.07)
                HStack(spacing: 0) {
                    VStack(alignment: .leading) {
                        BrandMark()
                        Spacer()
                        Text("Respire. Écoute. Reviens à toi.")
                            .font(.system(size: 18, weight: .medium, design: .serif).italic())
                            .foregroundStyle(Color(red: 0.14, green: 0.31, blue: 0.38).opacity(0.88))
                            .frame(maxWidth: 280, alignment: .leading)
                    }
                    .padding(.leading, 36)
                    .padding(.top, 24)
                    .padding(.bottom, 34)
                    .frame(width: geo.size.width * 0.43, alignment: .leading)

                    ZStack {
                        RoundedRectangle(cornerRadius: 34, style: .continuous)
                            .fill(Color.white.opacity(0.76))
                            .overlay(RoundedRectangle(cornerRadius: 34, style: .continuous).stroke(Color.white.opacity(0.78), lineWidth: 1))
                            .shadow(color: Color.black.opacity(0.05), radius: 18, y: 8)
                        VStack(alignment: .leading, spacing: 12) {
                            Text(kickers[page])
                                .font(.system(size: 11, weight: .bold))
                                .tracking(1.25)
                                .foregroundStyle(Color(red: 0.17, green: 0.48, blue: 0.56))
                            introContent(page)
                            Spacer(minLength: 8)
                            HStack {
                                Text("\(page + 1) / 6")
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundStyle(Color(red: 0.31, green: 0.44, blue: 0.49).opacity(0.8))
                                Spacer()
                                if page > 0 {
                                    Button { withAnimation(.easeInOut(duration: 0.25)) { page -= 1 } } label: {
                                        Text("Précédent")
                                    }
                                    .buttonStyle(SoftButtonStyle())
                                }
                                Button {
                                    if page < 5 { withAnimation(.easeInOut(duration: 0.25)) { page += 1 } }
                                    else { onDone() }
                                } label: {
                                    Text(page < 5 ? "Suivant" : "Découvrir mon espace")
                                }
                                .buttonStyle(PrimaryButtonStyle())
                            }
                        }
                        .padding(.horizontal, 28)
                        .padding(.vertical, 24)
                    }
                    .padding(.trailing, 26)
                    .padding(.vertical, 20)
                }
            }
        }
    }

    @ViewBuilder private func introContent(_ p: Int) -> some View {
        let ink = Color(red: 0.16, green: 0.28, blue: 0.33)
        let muted = Color(red: 0.24, green: 0.35, blue: 0.39)
        switch p {
        case 0:
            Text("Mon Oxygène")
                .font(.system(size: 30, weight: .semibold, design: .serif))
                .foregroundStyle(ink)
            Text("Respirer est un besoin vital.\nMais lorsqu’on y met de la conscience et du sens, chaque souffle devient un retour à soi.")
                .font(.system(size: 17, weight: .medium, design: .serif))
                .foregroundStyle(ink)
                .lineSpacing(4)
            Text("Mon Oxygène est une application de respiration guidée pensée comme un espace intérieur. Un moment pour accueillir ce qui est là, et laisser un peu plus de place à ce que l’on ressent.")
                .font(.system(size: 14.5, weight: .regular))
                .foregroundStyle(muted)
                .lineSpacing(4)
        case 1:
            Text("Ce que l’on ne contrôle pas")
                .font(.system(size: 27, weight: .semibold, design: .serif)).foregroundStyle(ink)
            Text("Nous ne contrôlons pas ce qui nous entoure.\nMais nous pouvons contrôler deux choses :\nnos actions… et nos réactions.")
                .font(.system(size: 15, weight: .regular)).foregroundStyle(muted).lineSpacing(4)
            Text("On ne respire pas pour changer le monde,\nmais pour retrouver un peu plus de liberté dans la manière d’y répondre.")
                .font(.system(size: 16, weight: .semibold, design: .serif)).foregroundStyle(ink).lineSpacing(4)
        case 2:
            Text("La respiration crée un espace de retour à soi")
                .font(.system(size: 25, weight: .semibold, design: .serif)).foregroundStyle(ink)
            Text("Respirer ne cherche pas à effacer ce que l’on ressent.\nC’est une façon de revenir doucement à soi, de prendre un peu de recul, et de laisser les choses se poser.\n\nCela permet d’accueillir ce qui est là, sans se juger, et de lui redonner sa juste place.")
                .font(.system(size: 14.5)).foregroundStyle(muted).lineSpacing(4)
            Text("Dans les moments d’inconfort, la respiration devient un chemin simple pour revenir à soi et retrouver un peu de sécurité intérieure.")
                .font(.system(size: 15.5, weight: .semibold, design: .serif)).foregroundStyle(ink).lineSpacing(3)
        case 3:
            Text("Inspire & Expire")
                .font(.system(size: 28, weight: .semibold, design: .serif)).foregroundStyle(ink)
            HStack(spacing: 12) {
                IntroCard(title: "À l’inspiration", text: "Inspire doucement par le nez.\nLaisse le ventre se gonfler naturellement.\n\nSi cela t’aide, imagine une lumière douce qui entre avec ton souffle et apporte un peu d’espace, de chaleur ou de calme à l’intérieur de toi.")
                IntroCard(title: "À l’expiration", text: "Expire doucement par la bouche.\nLe ventre redescend sans effort.\n\nTu peux imaginer que ton expiration emporte ce dont tu ne souhaites plus t’encombrer, sans chercher à faire disparaître ce que tu ressens.")
            }
            Text("Inspire ce qui te fait du bien.  •  Expire ce qui ne te convient plus.\nLe plus important n’est pas l’amplitude, mais le confort. Reste à l’écoute de ce qui te semble juste.")
                .font(.system(size: 12.5, weight: .semibold)).foregroundStyle(ink).lineSpacing(3)
        case 4:
            Text("Choisir son juste rythme")
                .font(.system(size: 27, weight: .semibold, design: .serif)).foregroundStyle(ink)
            HStack(spacing: 10) {
                RhythmCard(title: "Retrouver l’équilibre", rhythm: "5 / 5", body: "Un rythme simple et régulier pour revenir à soi.")
                RhythmCard(title: "Ralentir", rhythm: "4 / 6 ou 3 / 5", body: "Pour accompagner le calme et relâcher progressivement.")
                RhythmCard(title: "Dynamiser", rhythm: "6 / 4 ou 5 / 3", body: "Pour soutenir l’énergie et la mise en mouvement.")
            }
            Text("Il n’existe pas de bon rythme universel. Il y a seulement celui dans lequel ta respiration reste fluide et confortable.")
                .font(.system(size: 13.5, weight: .semibold, design: .serif)).foregroundStyle(ink).lineSpacing(3)
        default:
            Text("D’un outil vers une ressource")
                .font(.system(size: 27, weight: .semibold, design: .serif)).foregroundStyle(ink)
            Text("Pratiquer régulièrement ne sert pas seulement à se détendre sur le moment.\nAvec le temps, on apprend à mieux se connaître, à reconnaître plus tôt ce qui se passe en soi et à créer plus facilement un espace avant d’agir ou de réagir.\n\nPetit à petit, la respiration devient un repère naturel. Une manière de prendre soin de son Hêtre : revenir à soi avec douceur, s’écouter, et accueillir ce qui est là.")
                .font(.system(size: 14.2)).foregroundStyle(muted).lineSpacing(3.5)
            Text("La respiration ne change pas forcément ce qui se passe autour de nous. Mais elle peut changer la manière dont nous le traversons et le percevons.")
                .font(.system(size: 15, weight: .semibold, design: .serif)).foregroundStyle(ink).lineSpacing(3)
            Text("Pour cela, tu n’as rien à réussir, rien à forcer. Laisse simplement faire, de la manière la plus juste et la plus confortable pour toi, en faisant confiance à tes ressentis.")
                .font(.system(size: 12.8, weight: .medium)).foregroundStyle(muted).lineSpacing(2.5)
        }
    }
}

private struct IntroCard: View {
    let title: String, text: String
    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            Text(title).font(.system(size: 14, weight: .semibold, design: .serif)).foregroundStyle(Color(red: 0.15, green: 0.36, blue: 0.43))
            Text(text).font(.system(size: 11.3)).foregroundStyle(Color(red: 0.25, green: 0.35, blue: 0.39)).lineSpacing(2)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .background(Color.white.opacity(0.55), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

private struct RhythmCard: View {
    let title: String, rhythm: String, body: String
    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(title).font(.system(size: 12.5, weight: .semibold)).foregroundStyle(Color(red: 0.14, green: 0.35, blue: 0.42))
            Text(rhythm).font(.system(size: 18, weight: .semibold, design: .serif)).foregroundStyle(Color(red: 0.36, green: 0.45, blue: 0.72))
            Text(body).font(.system(size: 10.5)).foregroundStyle(Color(red: 0.28, green: 0.37, blue: 0.41)).lineSpacing(2)
        }
        .padding(11)
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .background(Color.white.opacity(0.56), in: RoundedRectangle(cornerRadius: 15, style: .continuous))
    }
}

private struct SettingsView: View {
    @Binding var config: SessionConfig
    let onStart: () -> Void

    var body: some View {
        GeometryReader { geo in
            ZStack {
                BackgroundPhoto(filename: "settings_bg.jpg", veil: 0.06)
                HStack(spacing: 0) {
                    VStack(alignment: .leading) {
                        BrandMark()
                        Spacer()
                        Text("Choisis simplement le rythme qui te semble juste aujourd’hui.")
                            .font(.system(size: 18, weight: .medium, design: .serif).italic())
                            .foregroundStyle(Color(red: 0.15, green: 0.31, blue: 0.38).opacity(0.88))
                            .frame(maxWidth: 285, alignment: .leading)
                        Text("La respiration doit toujours rester confortable.")
                            .font(.system(size: 12.5, weight: .medium))
                            .foregroundStyle(Color(red: 0.21, green: 0.39, blue: 0.44).opacity(0.8))
                            .padding(.top, 8)
                    }
                    .padding(.leading, 34).padding(.vertical, 25)
                    .frame(width: geo.size.width * 0.44, alignment: .leading)

                    VStack(alignment: .leading, spacing: 13) {
                        Text("Ma respiration")
                            .font(.system(size: 28, weight: .semibold, design: .serif))
                            .foregroundStyle(Color(red: 0.14, green: 0.30, blue: 0.36))
                        HStack(spacing: 11) {
                            ValueStepper(title: "Durée de la séance", value: $config.durationMinutes, range: 1...20, suffix: "min")
                            ValueStepper(title: "Inspiration", value: $config.inhaleSeconds, range: 2...10, suffix: "s")
                            ValueStepper(title: "Expiration", value: $config.exhaleSeconds, range: 2...10, suffix: "s")
                        }
                        HStack {
                            Text("Commencer par")
                                .font(.system(size: 12.5, weight: .semibold))
                                .foregroundStyle(Color(red: 0.23, green: 0.36, blue: 0.41))
                            Spacer()
                            StartPhaseToggle(isInhale: $config.startWithInhale)
                        }
                        HStack(spacing: 10) {
                            PresetButton(title: "Équilibre", value: "5 / 5") { config.inhaleSeconds = 5; config.exhaleSeconds = 5 }
                            PresetButton(title: "Ralentir", value: "4 / 6") { config.inhaleSeconds = 4; config.exhaleSeconds = 6 }
                            PresetButton(title: "Dynamiser", value: "6 / 4") { config.inhaleSeconds = 6; config.exhaleSeconds = 4 }
                        }
                        Button(action: onStart) {
                            HStack {
                                Spacer(); Text("Commencer ma séance").font(.system(size: 15, weight: .semibold)); Image(systemName: "arrow.right"); Spacer()
                            }
                            .foregroundStyle(.white)
                            .padding(.vertical, 13)
                            .background(LinearGradient(colors: [Color(red: 0.25, green: 0.75, blue: 0.79), Color(red: 0.45, green: 0.55, blue: 0.86)], startPoint: .leading, endPoint: .trailing), in: Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(.horizontal, 24).padding(.vertical, 21)
                    .background(Color.white.opacity(0.79), in: RoundedRectangle(cornerRadius: 30, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: 30).stroke(Color.white.opacity(0.86), lineWidth: 1))
                    .padding(.trailing, 26).padding(.vertical, 20)
                }
            }
        }
    }
}

private struct ValueStepper: View {
    let title: String
    @Binding var value: Int
    let range: ClosedRange<Int>
    let suffix: String
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.system(size: 11.5, weight: .semibold)).foregroundStyle(Color(red: 0.25, green: 0.38, blue: 0.42))
            HStack(spacing: 8) {
                StepButton(symbol: "minus") { if value > range.lowerBound { value -= 1 } }
                Text("\(value) \(suffix)").font(.system(size: 18, weight: .semibold, design: .serif)).foregroundStyle(Color(red: 0.16, green: 0.36, blue: 0.43)).frame(minWidth: 50)
                StepButton(symbol: "plus") { if value < range.upperBound { value += 1 } }
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white.opacity(0.62), in: RoundedRectangle(cornerRadius: 17))
    }
}

private struct StepButton: View {
    let symbol: String, action: () -> Void
    var body: some View {
        Button(action: action) { Image(systemName: symbol).font(.system(size: 12, weight: .bold)).frame(width: 27, height: 27).background(Color(red: 0.23, green: 0.62, blue: 0.69).opacity(0.14), in: Circle()) }
            .buttonStyle(.plain).foregroundStyle(Color(red: 0.15, green: 0.48, blue: 0.55))
    }
}

private struct StartPhaseToggle: View {
    @Binding var isInhale: Bool
    var body: some View {
        HStack(spacing: 4) {
            phase("Inspiration", selected: isInhale) { isInhale = true }
            phase("Expiration", selected: !isInhale) { isInhale = false }
        }
        .padding(4).background(Color.white.opacity(0.62), in: Capsule())
    }
    private func phase(_ text: String, selected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) { Text(text).font(.system(size: 11.5, weight: .semibold)).padding(.horizontal, 12).padding(.vertical, 7).background(selected ? Color(red: 0.25, green: 0.67, blue: 0.72) : .clear, in: Capsule()).foregroundStyle(selected ? .white : Color(red: 0.25, green: 0.39, blue: 0.44)) }.buttonStyle(.plain)
    }
}

private struct PresetButton: View {
    let title: String, value: String, action: () -> Void
    var body: some View {
        Button(action: action) {
            VStack(spacing: 2) { Text(title).font(.system(size: 11.5, weight: .semibold)); Text(value).font(.system(size: 14, weight: .semibold, design: .serif)) }
                .frame(maxWidth: .infinity).padding(.vertical, 9)
                .background(Color.white.opacity(0.62), in: RoundedRectangle(cornerRadius: 14))
        }.buttonStyle(.plain).foregroundStyle(Color(red: 0.18, green: 0.39, blue: 0.48))
    }
}

private struct BreathingSessionView: View {
    let config: SessionConfig
    let onStop: () -> Void

    @State private var startedAt = Date()
    @State private var accumulated: TimeInterval = 0
    @State private var paused = false
    @State private var didFinish = false
    private let completionTimer = Timer.publish(every: 0.25, on: .main, in: .common).autoconnect()

    var body: some View {
        GeometryReader { geo in
            TimelineView(.animation(minimumInterval: 1.0 / 30.0, paused: paused)) { timeline in
                let elapsed = currentElapsed(at: timeline.date)
                let state = phaseState(elapsed)
                ZStack {
                    BackgroundPhoto(filename: "curve_bg.jpg", veil: 0.02)
                    Color(red: 0.04, green: 0.16, blue: 0.21).opacity(0.08)

                    BreathingCurve(elapsed: elapsed, config: config)
                        .frame(width: geo.size.width, height: geo.size.height)

                    VStack(spacing: 4) {
                        Text(state.inhale ? "Inspirez" : "Expirez")
                            .font(.system(size: max(24, geo.size.height * 0.058), weight: .semibold, design: .serif))
                            .foregroundStyle(.white)
                            .shadow(color: Color.black.opacity(0.12), radius: 6, y: 2)
                        if let guide = guidance(elapsed: elapsed, inhale: state.inhale) {
                            Text(guide)
                                .font(.system(size: max(13, geo.size.height * 0.038), weight: .medium))
                                .foregroundStyle(.white.opacity(0.96))
                                .lineLimit(1)
                                .minimumScaleFactor(0.72)
                        }
                        Text("\(Int(ceil(state.remaining)))")
                            .font(.system(size: max(12, geo.size.height * 0.024), weight: .semibold))
                            .foregroundStyle(.white.opacity(0.86))
                            .padding(.top, 2)
                    }
                    .position(x: geo.size.width * 0.5, y: geo.size.height * 0.145)

                    LotusView(scale: 0.70 + 0.48 * state.breath)
                        .frame(width: geo.size.height * 0.082, height: geo.size.height * 0.082)
                        .position(x: geo.size.width * 0.5, y: curveY(wave: state.wave, height: geo.size.height))

                    VStack {
                        HStack {
                            BrandMark(light: true).padding(.leading, 28).padding(.top, 18)
                            Spacer()
                            HStack(spacing: 12) {
                                SessionControl(symbol: paused ? "play.fill" : "pause.fill") { togglePause() }
                                SessionControl(symbol: "stop.fill") { onStop() }
                            }
                            .padding(.trailing, 24).padding(.top, 16)
                        }
                        Spacer()
                        HStack(spacing: 18) {
                            ProgressViewBar(progress: min(1, elapsed / Double(config.durationMinutes * 60)))
                                .frame(maxWidth: .infinity)
                            TimePill(elapsed: elapsed, total: Double(config.durationMinutes * 60))
                                .frame(width: geo.size.width * 0.18)
                        }
                        .padding(.leading, geo.size.width * 0.10)
                        .padding(.trailing, geo.size.width * 0.035)
                        .padding(.bottom, geo.size.height * 0.038)
                    }
                }
            }
        }
        .onAppear { startedAt = Date(); accumulated = 0; paused = false; didFinish = false }
        .onReceive(completionTimer) { now in
            if !didFinish && currentElapsed(at: now) >= Double(config.durationMinutes * 60) {
                didFinish = true
                onStop()
            }
        }
    }

    private func currentElapsed(at now: Date) -> TimeInterval {
        paused ? accumulated : accumulated + now.timeIntervalSince(startedAt)
    }

    private func togglePause() {
        if paused {
            startedAt = Date(); paused = false
        } else {
            accumulated += Date().timeIntervalSince(startedAt); paused = true
        }
    }

    private func guidance(elapsed: TimeInterval, inhale: Bool) -> String? {
        let cycle = Double(config.inhaleSeconds + config.exhaleSeconds)
        let index = Int(elapsed / cycle) + 1
        guard index <= 4 else { return nil }
        let visualization = index % 2 == 0
        if visualization {
            return inhale ? "Imagine une lumière douce qui entre avec ton souffle" : "Laisse partir ce dont tu ne souhaites plus t'encombrer"
        }
        return inhale ? "Par le nez  •  le ventre se gonfle" : "Par la bouche  •  le ventre se dégonfle"
    }

    private func curveY(wave: Double, height: CGFloat) -> CGFloat {
        let top = height * 0.340, bottom = height * 0.820
        let mid = (top + bottom) / 2
        let amp = (bottom - top) * 0.46
        return mid - CGFloat(wave) * amp
    }

    private func phaseState(_ elapsed: TimeInterval) -> (inhale: Bool, remaining: Double, wave: Double, breath: Double) {
        let i = Double(config.inhaleSeconds), e = Double(config.exhaleSeconds), cycle = i + e
        var m = elapsed.truncatingRemainder(dividingBy: cycle)
        if m < 0 { m += cycle }
        if config.startWithInhale {
            if m < i {
                let q = m / i, wave = -cos(.pi * q)
                return (true, i - m, wave, (wave + 1) / 2)
            } else {
                let q = (m - i) / e, wave = cos(.pi * q)
                return (false, cycle - m, wave, (wave + 1) / 2)
            }
        } else {
            if m < e {
                let q = m / e, wave = cos(.pi * q)
                return (false, e - m, wave, (wave + 1) / 2)
            } else {
                let q = (m - e) / i, wave = -cos(.pi * q)
                return (true, cycle - m, wave, (wave + 1) / 2)
            }
        }
    }
}

private struct BreathingCurve: View {
    let elapsed: TimeInterval
    let config: SessionConfig
    var body: some View {
        Canvas { context, size in
            let top = size.height * 0.340, bottom = size.height * 0.820
            let mid = (top + bottom) / 2
            let amp = (bottom - top) * 0.46
            let cycle = Double(config.inhaleSeconds + config.exhaleSeconds)
            let span = cycle * 4.35
            var path = Path()
            let steps = max(240, Int(size.width / 2))
            for n in 0...steps {
                let x = size.width * CGFloat(n) / CGFloat(steps)
                let offset = (Double(x / size.width) - 0.5) * span
                let wave = waveAt(elapsed + offset)
                let y = mid - CGFloat(wave) * amp
                if n == 0 { path.move(to: CGPoint(x: x, y: y)) } else { path.addLine(to: CGPoint(x: x, y: y)) }
            }
            let grad = Gradient(colors: [Color(red: 0.22, green: 0.82, blue: 0.85), Color(red: 0.42, green: 0.69, blue: 0.93), Color(red: 0.67, green: 0.47, blue: 0.87)])
            context.stroke(path, with: .color(.white.opacity(0.22)), lineWidth: 9)
            context.stroke(path, with: .linearGradient(grad, startPoint: CGPoint(x: 0, y: 0), endPoint: CGPoint(x: size.width, y: 0)), lineWidth: 4.2)
        }
    }
    private func waveAt(_ t: Double) -> Double {
        let i = Double(config.inhaleSeconds), e = Double(config.exhaleSeconds), cycle = i + e
        var m = t.truncatingRemainder(dividingBy: cycle); if m < 0 { m += cycle }
        if config.startWithInhale {
            if m < i { return -cos(.pi * m / i) }
            return cos(.pi * (m - i) / e)
        } else {
            if m < e { return cos(.pi * m / e) }
            return -cos(.pi * (m - e) / i)
        }
    }
}

private struct LotusView: View {
    let scale: Double
    var body: some View {
        Group {
            if let img = bundleImage("lotus.png") {
                Image(uiImage: img).resizable().scaledToFit()
            } else {
                Image(systemName: "leaf.fill").resizable().scaledToFit().foregroundStyle(.white)
            }
        }
        .scaleEffect(scale)
        .animation(.linear(duration: 0.02), value: scale)
    }
}

private struct SessionControl: View {
    let symbol: String, action: () -> Void
    var body: some View {
        Button(action: action) {
            Image(systemName: symbol)
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(.white)
                .frame(width: 48, height: 48)
                .background(Color(red: 0.05, green: 0.34, blue: 0.40).opacity(0.88), in: Circle())
                .overlay(Circle().stroke(Color.white.opacity(0.92), lineWidth: 2))
                .shadow(color: Color.black.opacity(0.16), radius: 6, y: 2)
        }
        .buttonStyle(.plain)
    }
}

private struct ProgressViewBar: View {
    let progress: Double
    var body: some View {
        GeometryReader { geo in
            let p = max(0, min(1, progress))
            ZStack(alignment: .leading) {
                Capsule().fill(Color.white.opacity(0.82)).frame(height: 13)
                Capsule().fill(Color(red: 0.18, green: 0.51, blue: 0.67).opacity(0.22)).frame(width: geo.size.width * p, height: 12)
                Capsule().fill(LinearGradient(colors: [Color(red: 0.22, green: 0.82, blue: 0.85), Color(red: 0.36, green: 0.66, blue: 0.93), Color(red: 0.65, green: 0.45, blue: 0.88)], startPoint: .leading, endPoint: .trailing)).frame(width: geo.size.width * p, height: 8)
                Circle().fill(.white).frame(width: 13, height: 13).offset(x: max(0, geo.size.width * p - 6.5))
            }
            .frame(maxHeight: .infinity, alignment: .center)
        }.frame(height: 20)
    }
}

private struct TimePill: View {
    let elapsed: Double, total: Double
    var body: some View {
        Text("\(time(elapsed)) / \(time(total))")
            .font(.system(size: 14, weight: .semibold, design: .rounded))
            .foregroundStyle(Color(red: 0.13, green: 0.31, blue: 0.39))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 9)
            .background(Color.white.opacity(0.88), in: Capsule())
            .overlay(Capsule().stroke(Color(red: 0.27, green: 0.66, blue: 0.74).opacity(0.55), lineWidth: 1.2))
    }
    private func time(_ value: Double) -> String {
        let s = max(0, Int(value.rounded(.down)))
        return String(format: "%d:%02d", s / 60, s % 60)
    }
}

private struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 12.5, weight: .semibold))
            .foregroundStyle(.white)
            .padding(.horizontal, 16).padding(.vertical, 9)
            .background(LinearGradient(colors: [Color(red: 0.25, green: 0.72, blue: 0.76), Color(red: 0.43, green: 0.56, blue: 0.85)], startPoint: .leading, endPoint: .trailing), in: Capsule())
            .opacity(configuration.isPressed ? 0.78 : 1)
    }
}

private struct SoftButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 12.5, weight: .semibold))
            .foregroundStyle(Color(red: 0.20, green: 0.39, blue: 0.45))
            .padding(.horizontal, 14).padding(.vertical, 9)
            .background(Color.white.opacity(0.7), in: Capsule())
            .opacity(configuration.isPressed ? 0.72 : 1)
    }
}
