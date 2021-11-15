import React, { FunctionComponent, ReactNode, useState } from 'react';
import { FaTimes } from 'react-icons/fa'

export type ModalChildType = {
    children: ReactNode,
    onClose: () => void
}

const Modal: FunctionComponent<ModalChildType> = ({ children, onClose }) => {
    const [visible, setVisible] = useState<boolean>(true)

    const handleClose = () => {
        setVisible(false)
        onClose()
    }
    const modalClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
    }

    return (
        <>{visible && <div onClick={handleClose} className="transition delay-300 duration-1000 ease-in-out backdrop-filter absolute z-30 backdrop-blur-sm backdrop-contrast-600 h-screen w-screen top-0 flex content-center">
            <div onClick={(e) => modalClick(e)} className="border relative z-50 flex flex-col justify-center items-center content-center bg-white rounded-2xl shadow-2xl h-1/2 m-auto sm:w-4/5 md:w-3/5 lg:w-2/5">
                <FaTimes onClick={handleClose} className="cursor-pointer text-right mb-2 text-gray-400 hover:bg-gray-200 text-4xl p-1 absolute top-0 right-0 m-2" />
                {children}
            </div>
        </div>}
        </>
    )
}

export default Modal;
