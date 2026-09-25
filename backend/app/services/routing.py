import statistics
from ortools.constraint_solver import pywrapcp, routing_enums_pb2
from app.services import clustering
from app.services.distance import distance_m

BUS_SPEED_M_PER_MIN = 300

def make_time_table(points: list[dict]) -> list[list[int]]:
    table = []
    for a in points:
        row = []
        for b in points:
            meters = distance_m(a["lat"], a["lng"], b["lat"], b["lng"]) * 1.3
            row.append(round(meters / BUS_SPEED_M_PER_MIN))
        table.append(row)
    return table

def solve_routes(time_table: list[list[int]], demands: list[int], bus_count: int, capacity: int):
    manager = pywrapcp.RoutingIndexManager(len(time_table), bus_count, 0)
    routing = pywrapcp.RoutingModel(manager)

    def get_time(from_index, to_index):
        a = manager.IndexToNode(from_index)
        b = manager.IndexToNode(to_index)
        return time_table[a][b]
    time_id = routing.RegisterTransitCallback(get_time)
    routing.SetArcCostEvaluatorOfAllVehicles(time_id)

    def get_demand(index):
        return demands[manager.IndexToNode(index)]
    demand_id = routing.RegisterUnaryTransitCallback(get_demand)
    routing.AddDimensionWithVehicleCapacity(demand_id, 0, [capacity] * bus_count, True, "Capacity")

    params = pywrapcp.DefaultRoutingSearchParameters()
    params.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    params.time_limit.seconds = 5
    solution = routing.SolveWithParameters(params)
    if solution is None:
        return None

    routes = []
    for bus in range(bus_count):
        order = []
        index = routing.Start(bus)
        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            if node != 0:
                order.append(node)
            index = solution.Value(routing.NextVar(index))
        routes.append(order)
    return routes

def to_clock(total_minutes: int) -> str:
    return f"{total_minutes // 60}:{total_minutes % 60:02d}"

def make_times(order: list[int], time_table: list[list[int]], arrive_minutes: int = 8 * 60) -> list[str]:
    path = order + [0]
    t = arrive_minutes
    times = []
    for i in range(len(order) - 1, -1, -1):
        t = t - time_table[path[i]][path[i + 1]] - 1
        times.insert(0, to_clock(t))
    return times

def make_metrics(stops: list[dict], longest_minutes: int) -> dict:
    all_walks = []
    for s in stops:
        all_walks = all_walks + s["walks"]
    warning_count = sum(len(s["warnings"]) for s in stops)
    return {
        "total_time": longest_minutes,
        "stop_count": len(stops),
        "average_walk_distance": int(sum(all_walks) / len(all_walks)) if all_walks else 0,
        "max_walk_distance": int(max(all_walks)) if all_walks else 0,
        "walk_distance_spread": int(statistics.pstdev(all_walks)) if all_walks else 0,
        "safety_check_count": warning_count,
        "all_within_400m": bool(max(all_walks) <= 400) if all_walks else True,
    }

def remove_danger_stops(stops: list[dict]) -> list[dict]:
    safe = [s for s in stops if len(s["warnings"]) == 0]
    danger = [s for s in stops if len(s["warnings"]) > 0]
    if len(safe) == 0:
        return stops

    for stop in danger:
        for student in stop["members"]:
            nearest = safe[0]
            for s in safe:
                if distance_m(student["lat"], student["lng"], s["lat"], s["lng"]) < \
                   distance_m(student["lat"], student["lng"], nearest["lat"], nearest["lng"]):
                    nearest = s
            nearest["members"].append(student)

    new_stops = []
    for i, s in enumerate(safe):
        stop = clustering.make_stop(s["members"])
        stop["label"] = i + 1
        stop["warnings"] = clustering.make_warnings(stop)
        new_stops.append(stop)
    return new_stops

PLANS = [
    {"strategy": "efficiency", "radius_m": 400, "remove_danger": False},
    {"strategy": "fairness",   "radius_m": 150, "remove_danger": False},
    {"strategy": "safety",     "radius_m": 250, "remove_danger": True},
]

def make_three_plans(school: dict, students: list[dict], bus_count: int, capacity: int) -> list[dict]:
    results = []
    for plan in PLANS:
        stops = clustering.build_stops(students, plan["radius_m"])
        if plan["remove_danger"]:
            stops = remove_danger_stops(stops)

        points = [school] + stops
        time_table = make_time_table(points)
        demands = [0] + [s["student_count"] for s in stops]

        orders = solve_routes(time_table, demands, bus_count, capacity)
        if orders is None:
            continue

        buses = []
        longest = 0
        for bus_number, order in enumerate(orders):
            if len(order) == 0:
                continue
            times = make_times(order, time_table)
            bus_stops = []
            for node, time in zip(order, times):
                bus_stops.append({"stop_label": stops[node - 1]["label"], "time": time})
            buses.append({"bus": bus_number + 1, "stops": bus_stops})
            minutes = 8 * 60 - (int(times[0].split(":")[0]) * 60 + int(times[0].split(":")[1]))
            longest = max(longest, minutes)

        for s in stops:
            s.pop("members", None)

        results.append({
            "strategy": plan["strategy"],
            "stops": stops,
            "buses": buses,
            "metrics": make_metrics(stops, longest),
        })
    return results
