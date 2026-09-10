import WidgetKit
import SwiftUI

// Données partagées (App Group)
//
// Le format JSON est produit par utils/widgetSync.ts (WidgetPlanningSnapshot)
// et écrit ici par modules/widget-data-bridge/ios/WidgetDataBridgeModule.swift.

private let appGroupId = "group.fr.appen.studysen"
private let planningSnapshotKey = "planningSnapshot"

struct WidgetPlanningEvent: Codable {
    let id: String
    let title: String
    let room: String
    let start: String
    let end: String
    let color: String
    // "Aujourd'hui" / "Demain" / nom du jour / date, calculé côté JS
    // (utils/widgetSync.ts), lève l'ambiguïté sur le widget "prochain cours".
    let dayLabel: String
}

struct WidgetPlanningSnapshot: Codable {
    let generatedAt: String
    let todayEvents: [WidgetPlanningEvent]
    let nextEvent: WidgetPlanningEvent?

    static let empty = WidgetPlanningSnapshot(
        generatedAt: "", todayEvents: [], nextEvent: nil)
}

func loadPlanningSnapshot() -> WidgetPlanningSnapshot {
    guard
        let defaults = UserDefaults(suiteName: appGroupId),
        let json = defaults.string(forKey: planningSnapshotKey),
        let data = json.data(using: .utf8),
        let snapshot = try? JSONDecoder().decode(
            WidgetPlanningSnapshot.self, from: data)
    else {
        return .empty
    }
    return snapshot
}

// Formatage des dates
//
// Les dates viennent telles quelles de webAurion (ex: "2025-01-06T08:00:00+0100"),
// sans passer par toISOString() côté JS.

private let isoParser: ISO8601DateFormatter = {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return formatter
}()

private let timeDisplayFormatter: DateFormatter = {
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "fr_FR")
    formatter.timeZone = TimeZone(identifier: "Europe/Paris")
    formatter.dateFormat = "HH:mm"
    return formatter
}()

func formatEventTime(_ iso: String) -> String {
    guard let date = isoParser.date(from: iso) else { return "" }
    return timeDisplayFormatter.string(from: date)
}

extension Color {
    init(hex: String) {
        let sanitized = hex.replacingOccurrences(of: "#", with: "")
        var rgb: UInt64 = 0
        Scanner(string: sanitized).scanHexInt64(&rgb)
        self.init(
            red: Double((rgb & 0xFF0000) >> 16) / 255,
            green: Double((rgb & 0x00FF00) >> 8) / 255,
            blue: Double(rgb & 0x0000FF) / 255
        )
    }
}

// Deep link ouvert au tap sur un widget (voir app.json "scheme": "studysen")
private let planningDeepLink = URL(string: "studysen://planning")

// Timeline

struct PlanningEntry: TimelineEntry {
    let date: Date
    let snapshot: WidgetPlanningSnapshot
}

struct PlanningProvider: TimelineProvider {
    func placeholder(in context: Context) -> PlanningEntry {
        PlanningEntry(
            date: .now,
            snapshot: WidgetPlanningSnapshot(
                generatedAt: "",
                todayEvents: [
                    WidgetPlanningEvent(
                        id: "placeholder", title: "Mathématiques",
                        room: "B204", start: "", end: "", color: "#FFA99D",
                        dayLabel: "Aujourd'hui")
                ],
                nextEvent: WidgetPlanningEvent(
                    id: "placeholder", title: "Mathématiques", room: "B204",
                    start: "", end: "", color: "#FFA99D",
                    dayLabel: "Aujourd'hui")
            )
        )
    }

    func getSnapshot(
        in context: Context, completion: @escaping (PlanningEntry) -> Void
    ) {
        completion(PlanningEntry(date: .now, snapshot: loadPlanningSnapshot()))
    }

    func getTimeline(
        in context: Context,
        completion: @escaping (Timeline<PlanningEntry>) -> Void
    ) {
        let entry = PlanningEntry(date: .now, snapshot: loadPlanningSnapshot())
        // L'app force un rafraîchissement à chaque synchronisation réussie
        // (WidgetCenter.reloadAllTimelines, voir WidgetDataBridgeModule.swift).
        // Ce filet de 30 min ne sert qu'à garder l'horaire affiché à jour
        // si l'app n'a pas été ouverte depuis un moment.
        let nextUpdate = Calendar.current.date(
            byAdding: .minute, value: 30, to: .now)!
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }
}

// Widget carré "Cours du jour" (Home Screen)

struct PlanningDayWidgetEntryView: View {
    var entry: PlanningEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Aujourd'hui")
                .font(.caption)
                .fontWeight(.bold)

            if entry.snapshot.todayEvents.isEmpty {
                Spacer(minLength: 0)
                Text("Aucun cours aujourd'hui")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Spacer(minLength: 0)
            } else {
                ForEach(entry.snapshot.todayEvents.prefix(3), id: \.id) {
                    event in
                    HStack(alignment: .top, spacing: 6) {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(Color(hex: event.color))
                            .frame(width: 3)
                        VStack(alignment: .leading, spacing: 0) {
                            Text(event.title)
                                .font(.caption2)
                                .fontWeight(.semibold)
                                .lineLimit(1)
                            Text(
                                "\(formatEventTime(event.start))"
                                    + (event.room.isEmpty ? "" : " · \(event.room)")
                            )
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                        }
                    }
                }
                Spacer(minLength: 0)
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .containerBackground(.background, for: .widget)
        .widgetURL(planningDeepLink)
    }
}

struct PlanningDayWidget: Widget {
    let kind = "PlanningDayWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PlanningProvider()) {
            entry in
            PlanningDayWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Cours du jour")
        .description("Affiche les cours de la journée.")
        .supportedFamilies([.systemSmall])
    }
}

// Widget écran verrouillé "Prochain cours"

struct PlanningNextCourseWidgetEntryView: View {
    var entry: PlanningEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        Group {
            if let next = entry.snapshot.nextEvent {
                switch family {
                case .accessoryCircular:
                    ZStack {
                        AccessoryWidgetBackground()
                        VStack(spacing: 0) {
                            Image(systemName: "book.closed.fill")
                                .font(.system(size: 10))
                            Text(formatEventTime(next.start))
                                .font(.system(size: 13, weight: .semibold))
                        }
                    }
                    .widgetLabel("\(next.dayLabel) · \(next.title)")
                default:
                    // .accessoryRectangular
                    VStack(alignment: .leading, spacing: 1) {
                        Text(next.title)
                            .font(.headline)
                            .lineLimit(1)
                        Text(
                            "\(next.dayLabel) · \(formatEventTime(next.start)) - \(formatEventTime(next.end))"
                                + (next.room.isEmpty ? "" : " · \(next.room)")
                        )
                        .font(.caption2)
                        .lineLimit(1)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            } else {
                switch family {
                case .accessoryCircular:
                    ZStack {
                        AccessoryWidgetBackground()
                        Image(systemName: "checkmark")
                    }
                default:
                    Text("Aucun cours à venir")
                        .font(.caption2)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
        }
        .containerBackground(.clear, for: .widget)
        .widgetURL(planningDeepLink)
    }
}

struct PlanningNextCourseWidget: Widget {
    let kind = "PlanningNextCourseWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PlanningProvider()) {
            entry in
            PlanningNextCourseWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Prochain cours")
        .description("Affiche le prochain cours sur l'écran verrouillé.")
        .supportedFamilies([.accessoryRectangular, .accessoryCircular])
    }
}
