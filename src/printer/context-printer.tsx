import { useEffect, useRef, useState } from "preact/hooks"
import type { Context } from "../api/context"
import { Map, MapInstance } from "../core/map"
import { loadLocale, Locale } from "../api/locale"
import MapViewer from "../plugins/map"
import "./printer.css"
import Box, { Rectangle } from "./box"
import Toolbar from "./toolbar"

type ContextPrinterProps = {
    context: Context
}

type PageComponent = {
    type: string
    id: string
    box: Rectangle
}

type Page = {
    components: PageComponent[]
}

export default function ContextPrinter({ context }: ContextPrinterProps) {
    const [map, setMap] = useState<MapInstance | null>(null)
    const [selectedPage, setSelectedPage] = useState(0)
    const [orientation, setOrientation] = useState("portrait")
    const [sheet, setSheet] = useState("A4")
    const [pages, setPages] = useState<Page[]>([
        {
            components: [
                {
                    type: "text",
                    id: "title",
                    box: {
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "20px",
                    },
                },
                {
                    type: "map",
                    id: "map",
                    box: {
                        top: "100px",
                        left: "0",
                        width: "100%",
                        height: "50%",
                    },
                },
            ],
        },
    ])
    const [locale, setLocale] = useState<Locale | undefined>()
    useEffect(() => {
        if (context.windowTitle) {
            document.title = context.windowTitle
        }
        loadLocale().then(setLocale)
    }, [context])
    function addPage() {
        setPages((old) => [
            ...old,
            {
                components: [],
            },
        ])
    }
    function removePage(page: Page) {
        setPages((old) => old.filter((p) => p !== page))
    }
    function removeSelectedPage() {
        if (selectedPage > 0) {
            setPages((old) => old.filter((p, i) => i !== selectedPage))
        }
    }
    function renderComponent(component: PageComponent) {
        if (component.type === "map")
            return (
                <MapViewer
                    setMap={setMap}
                    context={context}
                    mapType="ol"
                    plugins={[]}
                    allPlugins={[]}
                    cfg={{}}
                />
            )
        if (component.type === "text")
            return <div contentEditable>{context.windowTitle || "Title"}</div>
        return null
    }
    function addComponent(type: string) {
        const newComponent: PageComponent = {
            id: "aaa",
            type,
            box: {
                left: "0",
                top: "50px",
                width: "100%",
                height: "20px",
            },
        }
        setPages((old) => {
            return old.map((p, idx) =>
                idx !== selectedPage
                    ? p
                    : {
                          ...p,
                          components: [...p.components, newComponent],
                      }
            )
        })
    }
    function toggleOrientation() {
        setOrientation((old) => (old === "portrait" ? "landscape" : "portrait"))
    }
    function toggleSheet() {
        setSheet((old) => (old === "A4" ? "A3" : "A4"))
    }
    useEffect(() => {
        document.body.classList.remove("portrait")
        document.body.classList.remove("landscape")
        document.body.classList.add(orientation)

        document.body.classList.remove("A4")
        document.body.classList.remove("A3")
        document.body.classList.add(sheet)

        const style = document.getElementById("page-style")
        if (style) document.head.removeChild(style)

        const pageStyle = document.createElement("style")
        pageStyle.id = "page-style"
        pageStyle.setAttribute("type", "text/css")
        pageStyle.appendChild(
            document.createTextNode(
                `@page {margin: 0; size: ${sheet} ${orientation}}`
            )
        )
        document.head.appendChild(pageStyle)
    }, [orientation, sheet])
    return (
        <Locale.Provider value={locale}>
            <Map.Provider value={map}>
                <Toolbar
                    addPage={addPage}
                    removePage={removeSelectedPage}
                    addComponent={addComponent}
                    orientation={orientation}
                    sheet={sheet}
                    toggleOrientation={toggleOrientation}
                    toggleSheet={toggleSheet}
                />
                {pages.map((page, idx) => (
                    <div
                        className={`sheet ${
                            selectedPage === idx ? "selected" : ""
                        }`}
                        onClick={() => setSelectedPage(idx)}
                    >
                        {idx > 0 && (
                            <div
                                className="remove"
                                onClick={() => removePage(page)}
                            >
                                X
                            </div>
                        )}
                        {page.components.map((c) => (
                            <Box id={`${c.id}-container`} rect={c.box}>
                                {renderComponent(c)}
                            </Box>
                        ))}
                    </div>
                ))}
            </Map.Provider>
        </Locale.Provider>
    )
}
