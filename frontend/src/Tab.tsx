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
            <div className={`py-2 px-4  ${isCurrent && 'bg-white shadow-lg'}`}>
                {children}
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
            <div className="flex flex-col gap-y-10">
                <div className="flex flex-col gap-y-2">
                    <div className="flex flex-col md:flex-row gap-x-">
                        {tabs.map((tab: Tab) => (
                            <Header key={tab.trigger} trigger={tab.trigger}>
                                <tab.Header />
                            </Header>
                        ))}
                    </div>
                    <span className="w-full bg-gray-500 rounded-lg h-1" />
                </div>
                {tabs.map((tab: Tab) => (
                    <>
                        {current === tab.trigger && <tab.Component key={tab.trigger} />}
                    </>
                ))}
            </div>
        </TabContext.Provider>
    )
}