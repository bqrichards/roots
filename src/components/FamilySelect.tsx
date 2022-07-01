import { FC, useCallback } from 'react'
import { InboxOutlined } from '@ant-design/icons'
import { Button, message, Modal, ModalProps, Typography, Upload } from 'antd'
import type { UploadProps } from 'antd/lib/upload/interface'

const { Dragger } = Upload

type FamilySelectProps = ModalProps & {
	/** Create a new family */
	makeNew: () => void
}

export const FamilySelect: FC<FamilySelectProps> = ({ makeNew, ...modalProps }) => {
	const beforeUpload = useCallback<UploadProps['beforeUpload']>(file => {
		console.log('Before upload:', file)
	}, [])

	const onChange = useCallback<UploadProps['onChange']>(info => {
		const { status } = info.file

		if (status !== 'uploading') {
			console.log(info.file, info.fileList)
		}

		if (status === 'done') {
			message.success(`${info.file.name} file uploaded successfully.`)
		} else if (status === 'error') {
			message.error(`${info.file.name} file upload failed.`)
		}
	}, [])

	return (
		<Modal
			title="Family Selection"
			style={{ width: '30vw' }}
			footer={null}
			destroyOnClose
			closable={false}
			{...modalProps}
		>
			<Button onClick={makeNew}>Make New</Button>
			<br />
			<Typography.Text>- or -</Typography.Text>
			<br />
			<Typography.Text>Upload existing:</Typography.Text>
			<div>
				<Dragger name="file" multiple={false} beforeUpload={beforeUpload} onChange={onChange}>
					<p className="ant-upload-drag-icon">
						<InboxOutlined />
					</p>
					<p className="ant-upload-text">Click or drag file to this area to upload</p>
					<p className="ant-upload-hint">Your .roots family file should go here.</p>
				</Dragger>
			</div>
		</Modal>
	)
}
