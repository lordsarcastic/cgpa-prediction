import React, { createContext, Dispatch, SetStateAction, FunctionComponent, ReactNode, useContext, useMemo, useState } from "react"

export type Tab = {
    trigger: string,
    Component: FunctionComponent<any>,
    Header: FunctionComponent
}

export type HeaderProps = {
    children: ReactNode,
    trigger: string
}

export const Header: FunctionComponent<HeaderProps> = ({ children, trigger }) => {
    const { current, setCurrent } = useContext(TabContext);

    const isCurrent = useMemo(() => {
        return current === trigger;
    }, [current, trigger])

    return (
        <div
            className={`text-gray-300 ${isCurrent && 'text-gray-900'} hover:text-gray-700 cursor-pointer col-span-1`}
            onClick={() => setCurrent(trigger)}
        >
            <div className="p-4">
                {children}
            </div>
            <div className="flex justify-center items-center">
                {isCurrent
                    ? <>
                    <div className="w-full h-px bg-black" />
                    <div className="w-10 h-10 transform rotate-45 border border-black" />
                    <div className="w-full h-px bg-black" />
                </>
                    : <div className="w-full h-px bg-black" />}
            </div>
        </div>
    )
}

export type TabContextProps = {
    current: string,
    setCurrent: Dispatch<SetStateAction<string>>
}

export type TabProps = {
    tabs: Tab[]
}

export const TabContext = createContext<TabContextProps>({} as TabContextProps)

export const TabWrapper: FunctionComponent<TabProps> = ({ tabs }) => {
    const [current, setCurrent] = useState<string>(tabs[0].trigger);

    const value = useMemo(() => ({
        current,
        setCurrent
    }), [current, setCurrent])

    return (
        <TabContext.Provider value={value}>
            <div className="flex flex-col md:flex-row gap-x- mb-8">
                {tabs.map((tab: Tab, index: number) => (
                        <Header key={tab.trigger} trigger={tab.trigger}>
                            <tab.Header />
                        </Header>
                ))}
            </div>
            {tabs.map((tab: Tab) => (
                <>
                    {current === tab.trigger && <tab.Component key={tab.trigger} />}
                </>
            ))}
        </TabContext.Provider>
    )
}